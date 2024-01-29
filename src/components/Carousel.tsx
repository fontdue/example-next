"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

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
