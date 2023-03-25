import Job from '../models/Job.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/index.js';
import checkPermissions from '../utils/checkPermissions.js';
import mongoose from 'mongoose';
import moment from 'moment';


const createJob = async (req, res) => {
  const { position, company } = req.body;

  if (!position || !company) {
    // gelen bilgiler (position, company, jobLocation, jobType, status)
    throw new BadRequestError('Please provide all values');
  }
  req.body.createdBy = req.user.userId; // createdBy a userın id sini eşitledik
  const job = await Job.create(req.body); // client den gönderilen job ve user ın id si var (mongodb ye kaydettik)

  res.status(StatusCodes.CREATED).json({ job });
};

/* 
// ----before search ----//
const getAllJobs = async (req, res) => {  

  const jobs = await Job.find({ createdBy: req.user.userId, status }); 
  res
    .status(StatusCodes.CREATED)
    .json({ jobs, totalJobs: jobs.length, numOfPages: 1 });
}; */

const getAllJobs = async (req, res) => {
  // console.log(req.user);  // test user ile giriş yapınca { userId: '6416ffc24441d1bc9852bd4c', testUser: true }
  const { status, jobType, sort, search } = req.query; // search için
  const queryObject = {
    createdBy: req.user.userId,
  };

  // add stuff based on condition
  // /jobs?status=all  da bütün jobs lar, /jobs?status=pending ile sadece pending li jobs lar gelecek
  if (status && status !== 'all') {
    queryObject.status = status;
  }
  // eğer search yok ise status ve jobType "undefined" çıkıyor ve all Jobs da gözükmüyor. bubun için jobType && jobType !== 'all' ve status && status !== 'all'  yapmalıyız
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  if (search) {
    queryObject.position = { $regex: search, $options: 'i' }; // searc e "a" yazdığımızda a ile başlayan position lar gelsin. $regex kullanmazsak positionun tam ismini yazmamız lazım
  }

  // NO AWAIT  //
  let result = Job.find(queryObject);

  // chain sort condition
  if (sort === 'latest') {
    result = result.sort('-createdAt'); // negatif: sondan başa
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt'); //  baştan sona
  }
  if (sort === 'a-z') {
    result = result.sort('position'); //  baştan sona
  }
  if (sort === 'z-a') {
    result = result.sort('-position'); // negatif: sondan başa
  }

  // --setup pagination -- //
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit; // 3. sayfada sonuç 20 olucak ve 20 dahil atlanacak 21 den başlanacak

  // 75
  // 10 10 10 10 10 10 10 5

  result = result.skip(skip).limit(limit); // skip = 0  ==>> 0 ıncı itemı  atla

  const jobs = await result;

  // -----totaljobs and numofpage--//

  const totalJobs = await Job.countDocuments(queryObject) // queryObject içindeki jobs ları sayıcak
  const numOfPages =  Math.ceil(totalJobs/limit)
  res
    .status(StatusCodes.CREATED)
    .json({ jobs, totalJobs,numOfPages });
};

// 1. METHOD    updateJob ====>   findOneAndUpdate ====> bir sakıncası Job MODEL da hook ları invoke etmez (şu an Job modelde olmasa bile ilerde belki kurarız)
const updateJob = async (req, res) => {
  const { id: jobId } = req.params;
  const { company, position } = req.body;

  if (!company || !position) {
    throw new BadRequestError('Please provide all Values');
  }
  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  /* check permissions 
  john ve marta login olduğunda sadece kendi jobs larını görebilir.
  Fakat john marta nın jobs larından birinin "id" sini ele geçirirse bununla marta nın jobs unu edit edebilir.
  Bu yüzden permissions u kontrol etmeliyiz ve ayrıca "admin" her kullanıcının jobs larını edit veya delete edebilmeli
    */

  // console.log(typeof req.user.userId); // string,  auth middleware den geliyor
  // console.log(typeof job.createdBy);  // object

  checkPermissions(req.user, job.createdBy); // bu id ler birbirine eşit ise aşağıdaki "updatedJob" ile update et değilse hata ver.

  // {_id:jobId} eşleşen id li job u "req.body" ile gönderilen ile update et
  const updatedJob = await Job.findOneAndUpdate({ _id: jobId }, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(StatusCodes.OK).json({ updatedJob });
};

// 2. METHOD updateJob    =====> save   ====>  sakıncası  bütün property leri tek tek güncellemeliyiz ( job.company = company;  gibi) ve bu değerlerden biri gelmezse hata alıcaz
/* const updateJob = async (req, res) => {
  const { id: jobId } = req.params;
  const { company, position, jobLocation  } = req.body;

  if (!company || !position) {
    throw new BadRequestError('Please provide all Values');
  }
  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  // bu değerlerden biri gelmezse hata alıcaz
  job.position = position;
  job.company = company;
  job.jobLocation = jobLocation;

  await job.save()

  res.status(StatusCodes.OK).json({job});
}; */

const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;
  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  checkPermissions(req.user, job.createdBy); // bu id ler birbirine eşit ise aşağıdaki "findOneAndDelete" ile delete et değilse hata ver.
  await job.remove();

  res.status(StatusCodes.OK).json({ msg: 'Success! Job remove' });
};

const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } }, // "req.user.userId" i "mongoose.Types.ObjectId" olarak almamız lazım
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  // console.log(stats);
  /*  [
 { _id: 'declined', count: 17 },
 { _id: 'pending', count: 29 },
 { _id: 'interview', count: 29 }
] */

  // stats ı array olarak değil de object olarak frontend e göndermek istiyoruz
  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  // user ın hiç veya tek bir stats ı olabilir. bu yüzden diğer değerleri "0" olarak gönderelim
  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: {
          year: {
            $year: '$createdAt',
          },
          month: {
            $month: '$createdAt',
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } }, // -1  sondan başa doğru sıralanacak
    { $limit: 6 }, // son 6 ayı alıcaz
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      // accepts 0-11
      const date = moment()
        .month(month - 1) // 0 = january bu yüzden gerçek ayı bulmak için -1
        .year(year)
        .format('MMM Y');
      return { date, count };
    })
    .reverse(); // sondan başlıyacak

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

export { createJob, deleteJob, getAllJobs, updateJob, showStats };
