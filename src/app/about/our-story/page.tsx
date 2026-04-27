import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{children}</p>
);

const StoryText = ({ children }: { children: string }) => (
  <p className="mt-4 text-gray-600 leading-relaxed">{children}</p>
);

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        <section className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Our mission</h1>
              <p className="mt-6 text-gray-600 text-lg leading-relaxed">
                Imagine a workplace where employees come to work inspired, feel safe, share a common purpose
                with peers and leaders, do their best work, and go home fulfilled. We are on a mission to make
                this happen across the world.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <SectionLabel>HOW IT STARTED</SectionLabel>
                <h2 className="mt-3 text-4xl font-bold text-gray-900 leading-tight">
                  Like a lot of good stories, it started with a pain too
                </h2>
                <StoryText>
                  Growing teams were managing core HR processes through disconnected sheets, repetitive follow-ups,
                  and manual approvals. We started Zodeck to remove this friction and give teams one simple system
                  to run the entire employee lifecycle with clarity and speed.
                </StoryText>
              </div>

              <div>
                <img
                  src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
                  alt="Minimal desk setup"
                  className="w-full h-[320px] md:h-[380px] object-cover rounded-2xl shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80"
                  alt="Team growth community"
                  className="w-full h-[320px] md:h-[380px] object-cover rounded-2xl shadow-sm"
                />
              </div>

              <div>
                <SectionLabel>THE PRESENT · VINI. VIDI. VICI.</SectionLabel>
                <h2 className="mt-3 text-4xl font-bold text-gray-900 leading-tight">
                  We came. We saw. We disrupted.
                </h2>
                <StoryText>
                  Today, organizations use Zodeck to run HR operations with confidence. From onboarding and
                  attendance to payroll, workflows, and helpdesk, our platform enables teams to move faster
                  while improving employee experience at scale.
                </StoryText>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
