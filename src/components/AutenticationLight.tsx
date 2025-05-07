import Image from 'next/image';
import Link from 'next/link';

function AutenticationLight() {
  return (
    <div className="relative dark:z-40 hidden flex-col bg-muted p-10  lg:flex  min-h-screen text-black dark:bg-neutral-950 ">
      <div className="absolute inset-0 min-h-screen">
        <div className="absolute inset-0 border-r-2  h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
          <div className="absolute  bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(255,167,38,0.30),transparent)]"></div>
        </div>
      </div>
      <div className="bg-zinc-900 h-full">
        <Link className="relative z-20 flex items-center font-bold text-2xl dark:text-white mt-20" href="/">
          <Image
            src="/gh_logo.png"
            alt="Logo de codecontrol"
            className="mr-4 w-full relative z-40"
            width={120}
            height={120}
          />
        </Link>
      </div>
      <div className=" z-20 mt-auto h-auto">
        <blockquote className="space-y-2">
          <p className="text-xl bg-transparent text-pretty dark:text-white">
            Combinamos control de procesos, desarrollo de software y consultoría organizacional para ofrecerte
            soluciones integrales que generan resultados reales.
          </p>
          <footer className="text-md dark:text-white">Grupo Horizonte</footer>
        </blockquote>
      </div>
    </div>
  );
}

export default AutenticationLight;
