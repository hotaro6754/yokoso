import { PlayCircle } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const collageImages = [
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1531498860502-7c67cf02f657?auto=format&fit=crop&w=700&q=80",
];

const videoThumbs = [
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=80",
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">CHANGE THE WORLD</p>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Life is too short to do mediocre work
              </h1>
              <p className="mt-5 text-gray-600 text-lg leading-relaxed max-w-xl">
                We are building a workplace where curiosity, ownership, and impact matter every day.
                Join a team that solves meaningful problems and creates products used by modern organizations.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {collageImages.map((img, idx) => (
                <img
                  key={img}
                  src={img}
                  alt={`Team culture ${idx + 1}`}
                  className="w-full h-28 sm:h-32 md:h-36 rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
                alt="Mission visual"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-indigo-950/70 flex items-center justify-center p-8 text-center">
                <div>
                  <p className="text-indigo-100 text-xs tracking-[0.2em] font-semibold uppercase">OUR MISSION</p>
                  <p className="mt-4 text-white text-lg md:text-2xl font-bold leading-snug">
                    WE ARE ON A MISSION TO CREATE INSPIRING DIGITAL WORKPLACES WHERE EMPLOYEES CAN DO THEIR BEST
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">WE HAVE A PURPOSE</p>
              <h2 className="mt-3 text-4xl font-bold text-gray-900 leading-tight">
                Join our purpose. Not because we are cool or you are cool
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We hire people who care deeply about the work and the people around them.
                If you want to build long-term value and leave every project better than you found it,
                you will feel at home here.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">CHANGE THE WORLD</p>
              <h2 className="mt-3 text-4xl font-bold text-gray-900 leading-tight">
                Skills matter some. Attitude matters most
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                We value humility, clarity, and positive intent. Technical skills can be developed,
                but mindset defines how we collaborate, learn, and grow together as one team.
              </p>
            </div>

            <div>
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"
                alt="Coffee mug inspiration"
                className="w-full h-80 rounded-lg object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-xl shadow-md bg-sky-50 border border-sky-100 p-8 md:p-10 flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h3 className="text-3xl font-bold text-gray-900">Join Our Team</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Be part of an innovative and passionate team shaping the future of HR tech.
                </p>
                <button
                  type="button"
                  className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  View all Job openings
                </button>
              </div>

              <div className="w-full lg:w-80">
                <img
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80"
                  alt="Professional team meeting"
                  className="w-full h-48 rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

