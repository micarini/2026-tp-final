import Link from "next/link";
import Image from "next/image";

export default function Logo({ href = "/", claro = false, palabra = false, className = "" }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center ${className}`}
    >
      <Image
        src={
          palabra
            ? "/tuppi-palabra-verde.svg"
            : claro
              ? "/tuppi-logo-claro.svg"
              : "/tuppi-logo-verde.svg"
        }
        alt="Tuppi"
        width={palabra ? 98 : 144}
        height={palabra ? 36 : 43}
        priority
        className={palabra ? "h-auto w-24" : "h-auto w-32 lg:w-36"}
      />
      <span className="sr-only">, ir al inicio</span>
    </Link>
  );
}
