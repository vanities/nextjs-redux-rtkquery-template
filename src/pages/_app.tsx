import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { wrapper } from "redux/store";
import { Layout } from "../components/layout";
import { SSRProvider } from "react-bootstrap";

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, []);

  return (
    <>
      <SSRProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SSRProvider>
    </>
  );
}

export default wrapper.withRedux(App);
