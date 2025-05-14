"use client";

import { useGetAllProductsQuery } from "@/redux/services/product/productApi";
import ProductCard from "./ProductCard";
import Link from "next/link";

const OfferProducts = () => {
  const { data: productData } = useGetAllProductsQuery();

  const activeProducts = productData?.results
    ?.filter(
      (item) =>
        item?.status !== "Inactive" && item?.offerPrice > 0 && item?.offerPrice
    )
    ?.slice(0, 14);

  return (
    <section className="my-container mt-10">
      <div className="py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg lg:text-3xl font-medium text-center lg:text-start">
            Offer Products
          </h2>
          <Link
            href={`/offers`}
            className="border-b border-primary font-semibold"
          >
            Show All
          </Link>
        </div>
        {activeProducts?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap justify-center gap-5">
            {activeProducts.map((product) => (
              <div key={product?._id}>
                <ProductCard item={product} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">
            No products available in this category.
          </p>
        )}
      </div>
    </section>
  );
};

export default OfferProducts;
