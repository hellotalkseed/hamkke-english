export default function Footer() {
  return (
    <footer className="bg-[#2B2B2B] py-10">

      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">


          {/* Brand */}
          <div className="text-center md:text-left">

            <h3 className="
              text-2xl
              text-white
              [font-family:var(--font-cormorant)]
            ">
              TalkSeed
            </h3>

            <p className="text-sm text-gray-300 mt-2">
              From Small Talk to Big Ideas
            </p>

          </div>



          {/* Navigation */}
          <div className="
            flex
            gap-6
            text-sm
            text-gray-300
          ">

            <a href="#about">About</a>
            <a href="#lessons">Lessons</a>
            <a href="#student-stories">Stories</a>
            <a href="#contact">Contact</a>

          </div>


        </div>



        <div className="
          border-t
          border-white/10
          mt-8
          pt-6
          text-center
          text-sm
          text-gray-400
        ">
          © 2026 TalkSeed. All rights reserved.
        </div>


      </div>

    </footer>
  );
}