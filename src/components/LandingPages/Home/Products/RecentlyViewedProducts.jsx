"use client";

import { useGetAllProductsQuery } from "@/redux/services/product/productApi";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";
import { selectProductIds } from "@/redux/services/device/deviceSlice";

const RecentlyViewedProducts = () => {
  const productIds = useSelector(selectProductIds);

  const { data: productData } = useGetAllProductsQuery();

  const activeProducts = productData?.results?.filter(
    (item) => item?.status !== "Inactive" && productIds.includes(item?._id)
  );

  return (
    <>
      {activeProducts?.length > 0 && (
        <section className="my-container relative border p-2 rounded-xl mt-10">
          <h2 className="my-5 lg:my-10 text-2xl lg:text-3xl font-medium text-center ">
            Recently Viewed Products
          </h2>
          {activeProducts?.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 md:flex md:flex-wrap justify-center items-start gap-5 xxl:gap-10">
              {activeProducts?.map((product) => (
                <div key={product?._id}>
                  <ProductCard item={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-xl font-semibold my-10">
              No products found.
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default RecentlyViewedProducts;
