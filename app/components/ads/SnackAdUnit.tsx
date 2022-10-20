import { useEffect } from "react";
import { isMobileOnly } from "react-device-detect";

const ensureSnackLoaderIsLoaded = (site_id: string) => {
  return new Promise<void>((resolve) => {
    const doc = document;
    const scriptId = "snack_loader_" + site_id;
    const existingScript = doc.getElementById(scriptId);
    const isExistingScriptLoaded =
      (existingScript && existingScript.getAttribute("snack-loaded")) ===
      "true";
    console.log("isExistingScriptLoaded:", isExistingScriptLoaded);

    const resolveScript = () => {
      let existingScript = doc.getElementById(scriptId);
      if (existingScript) {
        existingScript.setAttribute("snack-loaded", "true");
        resolve();
      }
    };

    if (isExistingScriptLoaded) {
      // Script has been loaded before, promise can be resolved.
      console.log("Resolving - script has been loaded before.");
      resolveScript();
      return;
    }

    if (existingScript && !isExistingScriptLoaded) {
      // Script has been added to DOM before, but it's not fully loaded yet.
      existingScript.addEventListener("load", function () {
        console.log(
          "Resolving - script has been added to DOM before, but only now has fully loaded."
        );
        resolveScript();
      });
      return;
    }

    // Script is not added to the DOM.
    var scriptElm = doc.createElement("script");
    scriptElm.id = scriptId;
    //https://header-bidding.snack-dev.co.uk/assets/js/snack-loader
    //https://cdn-header-bidding.snack-media.com/assets/js/snack-loader/
    scriptElm.src =
      "https://cdn-header-bidding.snack-media.com/assets/js/snack-loader/" +
      site_id;
    scriptElm.async = true;
    scriptElm.setAttribute("snack-loaded", "false");
    scriptElm.addEventListener("load", function () {
      console.log(
        "Resolving - script has been added to DOM for the first time, and has now fully loaded."
      );
      resolveScript();
    });
    console.log("doc", doc);
    var scriptsRef = doc.getElementsByTagName("script")[0];
    console.log("Reference node", scriptsRef);
    if (scriptsRef && scriptsRef.parentNode) {
      console.log("Running if code anyway");
      console.log("Parent node", scriptsRef.parentNode);
      console.log("New node", scriptElm);
      scriptsRef.parentNode.insertBefore(scriptElm, scriptsRef);
    }
  });
};

type Props = {
  siteId: string;
};
function SnackAdUnit({ siteId }: Props) {
  console.log("\nLoading snack ad unit\n");
  const unitName = isMobileOnly ? "snack_mex1" : "snack_dex1";
  useEffect(() => {
    console.log("\nLoading snack ad unit effect\n");
    const win = window as any;
    console.log("Initialising slot: ", unitName);
    ensureSnackLoaderIsLoaded(siteId).then(() => {
      console.log("Promisse to REFRESH resolved in Initiation bit.", unitName);
      win.refreshBid([unitName]);
    });

    return () => {
      console.log("Killing slot: ", unitName);
      ensureSnackLoaderIsLoaded(siteId).then(() => {
        console.log("Promisse to KILL resolved in Initiation bit.", unitName);
        win.killSlot([unitName]);
      });
    };
  }, []);

  return <div id={unitName} className="w-min mx-auto"></div>;
}

export default SnackAdUnit;
