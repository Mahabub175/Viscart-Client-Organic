"use client";

import LinkButton from "@/components/Shared/LinkButton";
import { useGetAllCategoriesQuery } from "@/redux/services/category/categoryApi";
import { setFilter } from "@/redux/services/device/deviceSlice";
import Image from "next/image";
import { useDispatch } from "react-redux";
import "swiper/css";

const Categories = () => {
  const dispatch = useDispatch();
  const { data: categories } = useGetAllCategoriesQuery();

  const activeCategories = categories?.results?.filter(
    (item) => item?.status !== "Inactive"
  );

  const itemClickHandler = (item) => {
    if (item?.name) {
      dispatch(setFilter(item?.name));
    }
  };
  return (
    <section className="my-container p-5 mt-20 relative">
      <h2 className="text-2xl lg:text-4xl font-medium text-center mb-10">
        Collections
      </h2>
      <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center items-start gap-5">
        {activeCategories?.map((item) => {
          return (
            <div className="group" key={item?._id}>
              <LinkButton href={`/products`}>
                <div
                  className="overflow-hidden w-[160px] h-[160px] mx-auto"
                  onClick={() => itemClickHandler(item)}
                >
                  <Image
                    src={
                      item?.attachment ??
                      "https://thumbs.dreamstime.com/b/demo-demo-icon-139882881.jpg"
                    }
                    alt={item?.name ?? "demo"}
                    width={160}
                    height={160}
                    className="w-[160px] h-[160px] mx-auto object-fill group-hover:scale-110 duration-500"
                  />
                </div>
                <h2 className="mt-4 text-md font-medium">{item?.name}</h2>
              </LinkButton>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;
