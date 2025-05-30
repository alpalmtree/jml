/** @jsxImportSource preact */

// Naive implementation, as elements will be scaped
function Layout(
  { head, children, scripts }: { head: any; children: any; scripts?: any },
) {
  return (

      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          {head}
        </head>
        <body>
          {children}
          {scripts ?? <div dangerouslySetInnerHTML={{ __html: "<script>console.log('no block')</script>"}}></div>}
        </body>
      </html>

  );
}

function Card({ children, color }: { children: any; color?: string }) {
  return (
    <div class="card" style={`border: 1px solid ${color ?? "red"}`}>
      {children}
      I'm inside the card layout. Color: {color}
    </div>
  );
}

function P({ text, color }: { text?: string; color?: string }) {
  return (
    <p style={`color: ${color ?? "black"}`}>{text ?? "no text provided"}</p>
  );
}

export default function Page() {
  return (
    <Layout
      head={<title>Home Page</title>}
    >
      <h1>Hi</h1>
      <h1>Home page</h1>
      <p>Paragraph from home page</p>
      <P text="Hi from void macro" color="green" />
      <P text="<h1>Should be escaped</h1>" color="orange" />

      <Card color="green">
        <p>Hi there</p>
      </Card>
      <Card color="blue">
        <p>Hi there</p>
      </Card>
    </Layout>
  );
}