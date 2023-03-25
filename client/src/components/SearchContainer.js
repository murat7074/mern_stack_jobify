import { FormRow, FormRowSelect } from '.';
import { useAppContext } from '../context/appContext';
import Wrapper from '../assets/wrappers/SearchContainer';
import {useState,useMemo} from "react" // for debounce

// debounce ile tüm işlemler SearchContainer.js de yapıldı
const SearchContainer = () => {


  const [localSearch, setLocalSearch] = useState("")  // debounce için "search" işlemini buradan locale olarak yapıcaz

  const {
    isLoading,
    search,
    searchStatus,
    searchType,
    sort,
    sortOptions,
    statusOptions,
    jobTypeOptions,
    handleChange,
    clearFilters,
  } = useAppContext();

  const handleSearch = (e) => {
    // if (isLoading) return; // debounce da gerek kalmıyor
    handleChange({ name: e.target.name, value: e.target.value }); 
  };

const handleSubmit = (e)=>{
  e.preventDefault()
  setLocalSearch("")
  clearFilters()
}

const debounce = ()=>{
  // console.log("debounce");
  let timeoutID;
  return (e)=>{
    setLocalSearch(e.target.value)
    clearTimeout(timeoutID)
    timeoutID = setTimeout(()=>{
 handleChange({ name: e.target.name, value: e.target.value });  // buraya "localSearch" yazma "e.target" diye devam et
    },1000)
  }
}

// react de debounce için useMemo yu kullanmalıyız. Çünkü useMemo 1 kez çalışır
const optimizedDebounce = useMemo(()=>debounce(),[])

  return (
    <Wrapper>
      <form className="form">
        <h4> search form </h4>
        <div className="form-center">
          {/* search position */}
          <FormRow
            type="text"
            name="search"
            // value={search}
            value={localSearch}
            // handleChange={handleSearch}
            handleChange={optimizedDebounce}
          />
          {/* search by status */}
          <FormRowSelect
            labelText="status"
            name="searchStatus"
            value={searchStatus}
            handleChange={handleSearch}
            list={['all', ...statusOptions]}
          />
          {/* search by type */}
          <FormRowSelect
            labelText="type"
            name="searchType"
            value={searchType}
            handleChange={handleSearch}
            list={['all', ...jobTypeOptions]}
          />
          {/* sort  */}
          <FormRowSelect
            name="sort"
            value={sort}
            handleChange={handleSearch}
            list={sortOptions}
          />
          <button
            className="btn btn-block btn-danger"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            clear filters
          </button>
        </div>
      </form>
    </Wrapper>
  );
};

export default SearchContainer;
