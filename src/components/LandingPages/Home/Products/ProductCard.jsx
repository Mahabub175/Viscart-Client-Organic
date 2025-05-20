import { Tooltip } from "antd";
import Image from "next/image";
import { useState } from "react";
import QuickViewHover from "../../Products/QuickViewHover";
import { useGetAllGlobalSettingQuery } from "@/redux/services/globalSetting/globalSettingApi";
import { formatImagePath } from "@/utilities/lib/formatImagePath";
import LinkButton from "@/components/Shared/LinkButton";
import QuickProductView from "@/components/Shared/Product/QuickProductView";

const ProductCard = ({ item }) => {
  const { data: globalData } = useGetAllGlobalSettingQuery();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="relative group lg:w-[220px] mx-auto h-[400px] flex flex-col border border-gray-200 p-2">
      <div className="relative overflow-hidden">
        <Image
          src={
            item?.mainImage
              ? formatImagePath(item?.mainImage)
              : "https://thumbs.dreamstime.com/b/demo-demo-icon-139882881.jpg"
          }
          alt={item?.name}
          width={200}
          height={260}
          className="h-[180px] lg:h-[200px] group-hover:scale-110 duration-500"
        />

        <div className="hidden lg:block absolute inset-x-0 bottom-0 transform translate-y-full group-hover:translate-y-0 duration-500 z-10">
          <QuickViewHover item={item} />
        </div>
        <div className="lg:hidden">
          <QuickViewHover item={item} />
        </div>
      </div>

      <div className="text-center">
        <LinkButton href={`/products/${item?.slug}`}>
          <Tooltip placement="top" title={item?.name}>
            <h2 className="text-sm text-center md:text-base lg:mt-3 hover:text-gray-500 duration-300 mb-4">
              {item?.name.length > 30
                ? item.name.slice(0, 30).concat("...")
                : item.name}
            </h2>
          </Tooltip>
        </LinkButton>
        <div className="absolute bottom-12 left-0 right-0 mb-4">
          <div className="flex items-center gap-4 justify-center mb-2">
            {item?.offerPrice > 0 && (
              <p className="text-sm lg:text-base line-through text-black/60">
                {globalData?.results?.currency + " " + item?.sellingPrice}
              </p>
            )}
            {item?.offerPrice > 0 ? (
              <p className="text-black text-sm lg:text-base">
                {globalData?.results?.currency + " " + item?.offerPrice}
              </p>
            ) : (
              <p className="text-black text-sm lg:text-base">
                {globalData?.results?.currency + " " + item?.sellingPrice}
              </p>
            )}
          </div>
          {!item?.stock > 0 ? (
            <div className="text-xs text-red-500">(Out Of Stock)</div>
          ) : (
            <div className="text-xs text-green-500">(In Stock)</div>
          )}
        </div>
        <div className="absolute bottom-2 left-0 right-0">
          <button
            className="bg-primary text-white px-5 py-2 mt-4 rounded-lg hover:scale-105 duration-300"
            onClick={() => setIsModalVisible(true)}
          >
            Quick Add
          </button>
        </div>
      </div>
      <QuickProductView
        item={item}
        isModalVisible={isModalVisible}
        handleModalClose={handleModalClose}
      />
    </div>
  );
};

export default ProductCard;
