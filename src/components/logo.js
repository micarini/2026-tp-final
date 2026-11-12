import Link from "next/link";
import Image from "next/image";

export default function Logo({ href = "/", claro = false, className = "" }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center ${className}`}
    >
      <Image
        src={claro ? "/tuppi-logo-claro.svg" : "/tuppi-logo-verde.svg"}
        alt="Tuppi"
        width={144}
        height={43}
        priority
        className="h-auto w-32 lg:w-36"
      />
      <span className="sr-only">, ir al inicio</span>
    </Link>
  );
}
