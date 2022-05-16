import { useSubmit } from "@remix-run/react";
import invariant from "tiny-invariant";

export default function useConnectWithWallet() {
  const submit = useSubmit();
  return async function connectWithWallet() {
    const { ethereum } = window;
    let message = "";
    if (!ethereum) {
      message =
        "Please install a crypto wallet browser extension to connect with a wallet.";
    }
    try {
      const result = await ethereum.request<string[]>({
        method: "eth_requestAccounts",
      });
      if (result) {
        invariant(result[0], "No accounts found.");
        const newFormData = new FormData();
        newFormData.set("wallet", result[0]);
        submit(newFormData, {
          method: "post",
          action: "/user/signup",
          replace: true,
        });
      }
    } catch (e) {
      message = "Error connecting to wallet";
      console.error(e);
    }
    return message;
  };
}
