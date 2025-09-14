import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import React from "react";

const Home = () => {
  return (
    <section className="max-w-7xl h-screen mx-auto flex flex-col p-2 gap-2">
      <Navbar />
      <Hero />
      <Footer />
    </section>
  );
};

export default Home;
