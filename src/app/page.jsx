'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="full-image" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/hero7.jpg')" }}>
        <div className="container" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ color: 'white', fontSize: '48px', marginBottom: '30px', textAlign: 'center', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
            Découvrez le monde avec Cornet de Voyage
          </h1>
          
          <p style={{ color: 'white', fontSize: '20px', maxWidth: '700px', textAlign: 'center', marginBottom: '40px', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}>
            Explorez des destinations fascinantes, partagez vos expériences et planifiez votre prochain voyage.
          </p>
          
          <Link href="/countries" className="button">
            Explorer les guides
          </Link>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'var(--dark)', paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container">
          <h2 className="section-title">Destinations populaires</h2>
          
          <div className="grid">
            <div className="card">
              <div className="card-image" style={{ backgroundImage: "url('/images/hero3.jpg')" }}></div>
              <div className="card-content">
                <div className="card-title">Égypte</div>
                <div>8 villes • 75 lieux</div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-image" style={{ backgroundImage: "url('/images/hero4.jpg')" }}></div>
              <div className="card-content">
                <div className="card-title">Italie</div>
                <div>11 villes • 96 lieux</div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-image" style={{ backgroundImage: "url('/images/hero5.jpg')" }}></div>
              <div className="card-content">
                <div className="card-title">Japon</div>
                <div>7 villes • 62 lieux</div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-image" style={{ backgroundImage: "url('/images/hero6.jpg')" }}></div>
              <div className="card-content">
                <div className="card-title">France</div>
                <div>9 villes • 84 lieux</div>
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link href="/countries" className="button">
              Voir tous les guides
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 