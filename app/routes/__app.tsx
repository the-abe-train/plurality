import { Outlet } from "@remix-run/react";
import SnackAdUnit from "~/components/ads/SnackAdUnit";

export default () => {
  return (
    <div>
      <Outlet />
      {/* <SnackAdUnit siteId="2903" /> */}
    </div>
  );
};
