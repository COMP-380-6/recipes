import "@fortawesome/fontawesome-svg-core/styles.css";
import {library, dom, config} from "@fortawesome/fontawesome-svg-core";
import {fas} from "@fortawesome/free-solid-svg-icons";

// Include CSS in webpack instead to avoid having to allow inline styles in CSP.
config.autoAddCss = false;

library.add(fas);
dom.watch();
