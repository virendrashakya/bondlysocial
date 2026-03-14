import clsx from "clsx";

interface Props {
  className?: string;
  rounded?: string;
}

export function Shimmer({ className, rounded = "rounded-lg" }: Props) {
  return (
    <div className={clsx("shimmer bg-dark-hover", rounded, className)} />
  );
}
