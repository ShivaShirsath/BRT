export function SimpleTable({ title, headers, rows, showTitle = false }: { title: string; headers: string[]; rows: string[][]; showTitle?: boolean }) {
  return (
    <section className="window-section">
      {showTitle && title}
      <div className="table-wrap scrollable-y">
        <table>
          <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={`${i}-${j}`}>{cell}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
