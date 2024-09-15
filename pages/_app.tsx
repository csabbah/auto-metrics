import "../styles/styles.css";
import Head from "next/head";
import { AppProps } from "next/app"; // Import AppProps for typing
import Layout from "../components/Layout"; // Import your Layout component

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Auto-Metrics</title>
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=no;user-scalable=0;"
        />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
