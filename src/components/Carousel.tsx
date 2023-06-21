"use client";
import { useEffect, useState } from "react";
/* @ts-ignore todo: update to swiper@10 to fix */
import { Pagination, Autoplay } from "swiper";
/* @ts-ignore */
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

if (typeof window !== "undefined")
  interface CarouselProps {
    children: React.ReactNode[];
  }

export default function Carousel({ children }: CarouselProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="carousel" data-loaded={loaded}>
      <Swiper
        /* @ts-ignore */
        modules={[Pagination, Autoplay]}
        autoplay
        loop
        pagination={{ el: ".carousel-pagination" }}
      >
        {children.map((child, i) => (
          <SwiperSlide key={i}>{child}</SwiperSlide>
        ))}
      </Swiper>

      <div className="carousel-pagination" />
    </div>
  );
}
