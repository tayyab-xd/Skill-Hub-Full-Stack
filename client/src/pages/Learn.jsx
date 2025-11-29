import React from 'react'

import HeroLearn from '../components/HeroLearn'
import PopularCourses from '../components/PopularCourses'
import Footer from '../components/FooterLearn'
import NavbarLearn from '../components/Navbar'

function Learn() {
  return (
    <div>
      {/* <NavbarLearn/> */}
      <HeroLearn />
      <PopularCourses />
      <Footer />
    </div>
  );
  
}

export default Learn
