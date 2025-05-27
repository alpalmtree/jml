/** @jsxImportSource react */
import { renderToString } from "react-dom/server";
// Naive implementation, as elements will be scaped
function Layout(
  { head, children, scripts },
) {
  return (
    
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          {head}
        </head>
        <body>
          {children}
          {scripts}
        </body>
      </html>

  );
}

function Card({ children, color }) {
  return (
    <div className="card" style={{ border: `1px solid ${color ?? "red"}` }}>
      {children}
      I'm inside the card layout. Color: {color}
    </div>
  );
}

function P({ text, color }) {
  return (
    <p style={{ color: `${color ?? "black"}`}}>{text ?? "no text provided"}</p>
  );
}

function Page() {
  return (
    <Layout
      head={<title>Home Page</title>}
      scripts={<script>console.log("hi from home")</script>}
    >
      <h1>Hi</h1>
      <h1>Home page</h1>
      <p>Paragraph from home page</p>
      <P text="Hi from void macro" color="green" />

      <Card color="green">
        <p>Hi there</p>
      </Card>
      <Card color="blue">
        <p>Hi there</p>
      </Card>
    </Layout>
  );
}
Deno.bench("react jsx with macros", { group: "rendering" }, () => {
  renderToString(<Page />);
});
