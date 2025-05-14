"use client";

import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { SwiperSlide, Swiper } from "swiper/react";
import "swiper/css";
import { useGetAllSlidersQuery } from "@/redux/services/slider/sliderApi";
import Link from "next/link";
import useGetURL from "@/utilities/hooks/useGetURL";
import { useEffect } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import { useAddServerTrackingMutation } from "@/redux/services/serverTracking/serverTrackingApi";

const Banner = () => {
  const { data: sliders } = useGetAllSlidersQuery();

  const url = useGetURL();
  const [addServerTracking] = useAddServerTrackingMutation();

  useEffect(() => {
    sendGTMEvent({ event: "PageView", value: url });
    const data = {
      event: "PageView",
      data: {
        event_source_url: url,
      },
    };
    addServerTracking(data);
  }, [url]);

  const activeSliders = sliders?.results?.filter(
    (item) => item.status === "Active" && !item?.bottomBanner
  );

  return (
    <section className="relative mb-10">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        className="max-h-[700px]"
      >
        {activeSliders?.map((item) => {
          return (
            <SwiperSlide key={item?._id}>
              <Link href={`/products?filter=${item?.category?.name}`}>
                <Image
                  src={
                    item?.attachment ??
                    "https://thumbs.dreamstime.com/b/demo-demo-icon-139882881.jpg"
                  }
                  alt={item.name}
                  width={2500}
                  height={700}
                  className="h-[200px] lg:h-fit w-full"
                />
                <div className="absolute z-10 top-20 lg:top-[45%] left-[5%]">
                  {item?.name && (
                    <h2 className="text-primary text-3xl lg:text-7xl font-bold mb-2 lg:mb-6">
                      {item?.name}
                    </h2>
                  )}
                  {item?.buttonText && (
                    <button className="bg-primary px-5 py-2 lg:px-10 lg:py-4 lg:text-xl font-bold text-white rounded-xl">
                      {item?.buttonText}
                    </button>
                  )}
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default Banner;
