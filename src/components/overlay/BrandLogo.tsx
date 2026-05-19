import { cn } from "@/lib/utils";
import logoSrc from "../X1_logoSemFundo.png";

export function BrandLogo({
  className,
  alt = "X1?",
  overflowBottom = "0px",
}: {
  className?: string;
  alt?: string;
  /**
   * Estende o clip visual abaixo do container.
   * "0px" = recorta nas bordas exatas (sem overflow).
   * "2rem" = permite que 2rem da imagem escale fora abaixo.
   */
  overflowBottom?: string;
}) {
  /*
   * inset(T R B L round radius)
   *  - T/R/L = 0  → clip nos limites exatos do elemento (corta laterais)
   *  - B negativo → ESTENDE o clip para baixo (permite overflow descendente)
   * Isso substitui o overflow-hidden (que bloquearia o overflow-bottom)
   * enquanto ainda corta os lados da imagem escalada.
   */
  const clipPath = `inset(0 0 -${overflowBottom} 0 round 1.8rem)`;

  return (
    <div
      className={cn(
        "logo-border-premium",
        "relative inline-flex items-center justify-center",
        // SEM overflow-hidden — o clip-path controla tudo
        "rounded-[1.8rem] bg-[color:var(--surface)]",
        className,
      )}
      style={{ clipPath }}
    >
      {/*
       * scale(2.2) amplia o núcleo central da logo.
       * Os lados que transbordam são cortados pelo clip-path (inset lateral 0).
       * translateY(4px) empurra ligeiramente para baixo — o excedente
       * fica visível graças ao `overflowBottom` negativo no clip-path.
       */}
      <img
        src={logoSrc}
        alt={alt}
        className="relative z-10 object-contain pointer-events-none select-none"
        style={{
          height: "96px",
          width: "auto",
          transform: "scale(0.9) translateY(4px)",
          transformOrigin: "center center",
        }}
        draggable={false}
      />
    </div>
  );
}
