import Image from "next/image";

export default function Sphere() {
  return (
    // <figure
    //   className="fixed top-[calc(100vh-350px)] -right-40 z-0 m-0 block h-[600px] w-[600px] rounded-full mix-blend-difference"
    //   style={{
    //     background: "radial-gradient(circle at 180px 180px, #999, #000)",
    //   }}
    // ></figure>
    <div className="fixed top-[calc(100vh-550px)] -right-40 z-0 m-0 block h-[600px] w-[600px] mix-blend-difference">
      <div className="relative h-full w-full rotate-0 saturate-0">
        <Image
          alt="Yours truly,"
          src="assets/zorb-monochrome.svg"
          width={600}
          height={600}
        />
      </div>
    </div>
  );
}
