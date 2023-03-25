import React from 'react';
import main from '../assets/images/main.svg';
import Wrapper from '../assets/wrappers/Testing';
import {Logo} from "../components"
import {Link,Navigate} from "react-router-dom"
import { useAppContext } from '../context/appContext';

const Landing = () => {

  const {user} = useAppContext()

  return (
    <React.Fragment>
      {user && <Navigate to="/"/>}  {/* user elle "http://localhost:3000/landing" yazarsa logout olmayacak (home page e yönlendireceğiz) */}
    <Wrapper>
      <nav>
       <Logo/>
      </nav>
      <div className="container page">
        {/* info */}
        <div className="info">
          <h1>
            job <span>tracking</span> app
          </h1>
          <p>
            I'm baby godard cronut unicorn pug waistcoat helvetica bushwick roof
            party activated charcoal butcher umami sustainable flexitarian la
            croix. Quinoa mixtape tote bag thundercats, yr pop-up succulents
            synth truffaut.
          </p>
          <Link to="/register" className="btn btn-hero">Login/Register</Link>
        </div>
        <img src={main} alt="job hunt" className="img main-img" />
      </div>
    </Wrapper>
    </React.Fragment>
  );
};



export default Landing;
