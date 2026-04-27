"use client";

import Image from "next/image";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { founders } from "@/data/founders";

type Leader = {
  name: string;
  role: string;
  image: string;
};

const leadershipTeam: Leader[] = [...founders];

function LeaderCard({ leader }: { leader: Leader }) {
  return (
    <article className="h-full rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition">
      <div className="flex justify-center">
        <Image
          src={leader.image}
          alt={leader.name}
          width={96}
          height={96}
          className="rounded-full object-cover"
        />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {leader.name}
      </h3>

      <p className="mt-1 text-sm text-gray-600">
        {leader.role}
      </p>
    </article>
  );
}

export default function OurTeamPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* HERO */}
        <section className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                When great people work together,
                <br />
                <span className="text-primary">awesome</span> happens
              </h1>

              <p className="mt-6 text-gray-600 text-lg leading-relaxed">
                We are a bunch of fun loving and good humans each with their own passions
                and goals, but united by a journey and a mission.
              </p>
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                WHY OWN THIS ORGANIZATION
              </p>

              <h2 className="mt-3 text-4xl font-bold text-gray-900 leading-tight">
                Our people make all the difference
              </h2>

              <p className="mt-4 text-gray-600 leading-relaxed">
                We believe culture is not a poster on the wall. It is built every day
                through trust, ownership, and collaboration. Our team combines deep
                domain expertise with a shared commitment to build practical products
                that help organizations work better.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl min-h-[360px]">
              <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644"
                alt="Mission card"
                fill
                className="object-cover"
              />

              <div className="absolute inset-0 bg-indigo-950/70 p-8 flex flex-col justify-end">
                <p className="text-indigo-100 text-xs tracking-[0.2em] font-semibold uppercase">
                  OUR MISSION
                </p>

                <p className="mt-3 text-white text-xl md:text-2xl font-bold leading-snug max-w-md">
                  WE ARE ON A MISSION TO CREATE INSPIRING DIGITAL WORKPLACES WHERE
                  EMPLOYEES CAN DO THEIR BEST
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CULTURE */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
                alt="Modern architecture"
                width={800}
                height={340}
                className="rounded-2xl object-cover w-full h-[340px]"
              />
            </div>

            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                OUR CULTURE
              </p>

              <h2 className="mt-3 text-4xl font-bold text-gray-900 leading-tight">
                Our culture is everything to us
              </h2>

              <p className="mt-4 text-gray-600 leading-relaxed">
                We work with empathy, communicate clearly, and challenge each
                other respectfully. We celebrate wins together and treat every
                setback as a learning moment. This is how we create products that
                people genuinely love using.
              </p>
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-gray-900">
                Our leaders eat last
              </h2>

              <p className="mt-4 text-gray-600 leading-relaxed">
                Leadership at Zodeck means enabling teams, removing blockers,
                and creating an environment where everyone can do meaningful work.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {leadershipTeam.map((leader) => (
                <LeaderCard key={leader.name} leader={leader} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}