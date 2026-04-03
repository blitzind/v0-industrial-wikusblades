import { ContactForm } from '@/components/contact-form';
import { SiteHeader } from '@/components/site-header';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col" style={{fontFamily: 'Arial, Helvetica, sans-serif'}}>
      {/* Header */}
      <SiteHeader />

      {/* Hero Image Section */}
      <section className="w-full" style={{height: '280px', backgroundImage: 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Marathon-M42_Emulsion-d4AtnJ0GJ4kkPXyYAIS4TP0H2Ecjlq.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'}}>
        <div style={{position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.15)'}}></div>
        <div className="w-full max-w-[1200px] mx-auto px-[15px] h-full flex items-center justify-start relative z-10">
          <h1 style={{fontSize: '36px', fontWeight: 'bold', color: 'white', lineHeight: '1.3', maxWidth: '700px', margin: 0, textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'}}>
            High-Performance Bandsaw Blades for Demanding Metal Cutting
          </h1>
        </div>
      </section>

      {/* Form and Content Section */}
      <section>
        <div className="w-full max-w-[1200px] mx-auto px-[15px] py-[40px] flex flex-col md:flex-row gap-[30px] items-start">
          {/* Left Column */}
          <div className="flex-1 md:max-w-[calc(100%-530px)]">
            <h2 className="text-[32px] text-[#003366] font-bold mb-[15px]" style={{margin: '0 0 15px 0', lineHeight: '1.25'}}>
              Find the Right Bandsaw Blade for Your Application
            </h2>
            <h3 className="text-[20px] text-[#333333] font-semibold mb-[18px]" style={{margin: '0 0 18px 0', lineHeight: '1.3'}}>
              Talk to a WIKUS bandsaw blade specialist about improving cut performance, reducing downtime, and extending blade life.
            </h3>
            <p className="text-[#555555] text-[16px] leading-[1.55] mb-[22px]" style={{margin: '0 0 22px 0'}}>
              WIKUS bandsaw blades are engineered for demanding metal cutting applications where consistency, durability, and productivity matter. Whether you are cutting solid materials, bundles, structural shapes, or difficult alloys, our team can help you identify the blade solution that best fits your production environment.
            </p>
            
            <ul className="m-0 p-0 pl-[18px] mb-[22px]" style={{listStyle: 'disc', margin: '0 0 22px 0', padding: '0 0 0 18px'}}>
              <li className="text-[#555555] text-[16px] leading-[1.6] mb-[10px]">
                Improve cut consistency across demanding applications
              </li>
              <li className="text-[#555555] text-[16px] leading-[1.6] mb-[10px]">
                Reduce blade breakage and unplanned downtime
              </li>
              <li className="text-[#555555] text-[16px] leading-[1.6] mb-[10px]">
                Extend blade life and lower cost per cut
              </li>
              <li className="text-[#555555] text-[16px] leading-[1.6] mb-[10px]">
                Get guidance from a bandsaw blade specialist
              </li>
            </ul>
            
            <p className="text-[#003366] text-[16px] font-semibold" style={{margin: '0', lineHeight: '1.5'}}>
              Complete the form to connect with a WIKUS bandsaw blade specialist.
            </p>
          </div>

          {/* Right Column - Form */}
          <div style={{flexShrink: 0, alignSelf: 'flex-start', width: '500px', backgroundColor: 'white', border: '1px solid #e0e0e0', padding: '0'}}>
            <div className="bg-[#003366] text-white px-[15px] py-[10px] text-[14px] font-semibold">
              Request Distributor Contact to Talk to a Bandsaw Blade Specialist
            </div>
            <div style={{padding: '20px'}}>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003366] text-white" style={{marginTop: 'auto'}}>
        <div className="w-full max-w-[1200px] mx-auto px-[15px] py-[15px]">
          <div className="text-[#b0c4d8] text-[11px]">
            &copy; 2026 WIKUS Saw Technology, Corp. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
