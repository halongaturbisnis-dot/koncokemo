import { HeroSlider } from "../components/sections/HeroSlider";
import { CeritaKoncoHighlight } from "../components/sections/CeritaKoncoHighlight";
import { BeritaTerbaru } from "../components/sections/BeritaTerbaru";

export function PublicLayout() {
  return (
    <>
      <HeroSlider />
      <CeritaKoncoHighlight />
      <BeritaTerbaru />
    </>
  );
}
