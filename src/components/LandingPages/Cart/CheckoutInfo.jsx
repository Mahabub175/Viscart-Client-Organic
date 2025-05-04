/* eslint-disable react-hooks/exhaustive-deps */
import { Form, Radio } from "antd";
import Image from "next/image";
import CustomInput from "@/components/Reusable/Form/CustomInput";
import { useGetAllGlobalSettingQuery } from "@/redux/services/globalSetting/globalSettingApi";
import { FaCartShopping } from "react-icons/fa6";
import bkash from "@/assets/images/bkash.png";
import cod from "@/assets/images/cod.png";
import eft from "@/assets/images/bank.png";
import ssl from "@/assets/images/ssl.png";
import nagad from "@/assets/images/nagad.png";
import rocket from "@/assets/images/rocket.png";
import upay from "@/assets/images/upay.png";
import surecash from "@/assets/images/surecash.png";
import { SubmitButton } from "@/components/Reusable/Button/CustomButton";

const CheckoutInfo = ({ isLoading }) => {
  const form = Form.useFormInstance();
  const selectedPayment = Form.useWatch("paymentMethod", form);
  const { data: globalData } = useGetAllGlobalSettingQuery();

  const imageMap = {
    cod,
    bkash,
    bank: eft,
    ssl,
    Nagad: nagad,
    Bkash: bkash,
    Rocket: rocket,
    Upay: upay,
    SureCash: surecash,
  };

  const manualPayments =
    Array.isArray(globalData?.results?.manualPayments) &&
    globalData.results.manualPayments.filter(
      (item) => item.status === "Active"
    );

  const paymentOptions = [
    {
      value: "cod",
      label: "Cash on Delivery",
      image: imageMap.cod,
      info: globalData?.results?.codMessage,
    },
    ...(globalData?.results?.bank === "Active"
      ? [
          {
            value: "bank",
            label: "EFT/RTGS",
            image: imageMap.bank,
            info: globalData?.results?.bankMessage,
          },
        ]
      : []),
    ...(globalData?.results?.ssl === "Active"
      ? [
          {
            value: "ssl",
            label: "SSLCommerz",
            image: imageMap.ssl,
            info: "SSLCommerz: You will be redirected to the SSLCommerz payment gateway.",
          },
        ]
      : []),
    ...(manualPayments
      ? manualPayments.map((item) => ({
          value: "manual" + item.name,
          label: item.name,
          image: imageMap[item.name] || null,
          info: item.description,
        }))
      : []),
  ];

  return (
    <div>
      <CustomInput type="text" name="name" label="Name" required />
      <CustomInput type="number" name="number" label="Number" required />
      <CustomInput type="textarea" name="address" label="Address" required />

      <Form.Item
        name="paymentMethod"
        label="Payment Method"
        required
        rules={[{ required: true, message: `Payment Method is required` }]}
      >
        <Radio.Group className="flex flex-col gap-4">
          {paymentOptions.map((option) => (
            <div key={option.value} className="flex flex-col">
              <Radio value={option.value}>
                <div className="font-semibold flex items-center gap-2 -my-3">
                  <span>{option.label}</span>
                  {option.image && (
                    <Image
                      src={option.image}
                      alt={option.label}
                      width={50}
                      className="object-contain"
                    />
                  )}
                </div>
              </Radio>
              {selectedPayment === option.value && (
                <div
                  className="mt-1 pl-6 text-sm font-medium space-y-1"
                  dangerouslySetInnerHTML={{ __html: option.info }}
                />
              )}
              {selectedPayment === "manual" + option.label && (
                <div className="mt-5 -mb-5 pl-5">
                  <CustomInput
                    type="text"
                    name="tranId"
                    label="Transaction ID"
                    required
                  />
                  <CustomInput
                    type="text"
                    name="transactionNumber"
                    label="Sender Number"
                  />
                </div>
              )}
            </div>
          ))}
        </Radio.Group>
      </Form.Item>

      <SubmitButton
        size="large"
        icon={<FaCartShopping />}
        loading={isLoading}
        disabled={isLoading}
        fullWidth
        text="Place Order"
      />
    </div>
  );
};

export default CheckoutInfo;
