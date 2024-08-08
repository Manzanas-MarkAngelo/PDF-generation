const rowsPerPage = 500;
let currentPage = 1;
let totalPages = 1;

function fetchTableData(page) {
  const url = `http://localhost/controller_lis/fetch_materials.php?page=${page}&limit=${rowsPerPage}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      populateTable(data.data);
      totalPages = data.totalPages;
      updatePaginationButtons();
    })
    .catch(error => console.error('Error fetching data:', error));
}

function populateTable(materials) {
  const tableBody = document.getElementById('table-body');
  tableBody.innerHTML = '';

  materials.forEach(material => {
    tableBody.innerHTML += `
      <tr>
        <td>${material.accnum}</td>
        <td>${material.author}</td>
        <td>${material.title}</td>
        <td>${material.copyright}</td>
        <td>${material.callno}</td>
        <td>${material.subj}</td>
        <td>${material.status}</td>
      </tr>
    `;
  });
}

function updatePaginationButtons() {
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  
  prevButton.classList.toggle('disabled', currentPage === 1);
  nextButton.classList.toggle('disabled', currentPage >= totalPages);

  prevButton.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchTableData(currentPage);
    }
  };

  nextButton.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchTableData(currentPage);
    }
  };
}

// Initial fetch
fetchTableData(currentPage);

function generatePDFPreview() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape');
  const title = "Polytechnic University of the Philippines - Taguig Campus";
  const subtitle = "PUPT INVENTORY REPORTS";

  // Show loading indicator
  document.getElementById('loading-indicator').style.display = 'block';

  // Extract table data from the HTML table
  const tableBody = document.getElementById('table-body');
  const tableRows = Array.from(tableBody.getElementsByTagName('tr'));

  const tableData = tableRows.map(row => {
    const cells = row.getElementsByTagName('td');
    return [
      cells[0].innerText,
      cells[1].innerText,
      cells[2].innerText,
      cells[3].innerText,
      cells[4].innerText,
      cells[5].innerText,
      cells[6].innerText
    ];
  });

  doc.setFontSize(16);
  doc.setTextColor("#800000");
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor("#000000");
  doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, 23, { align: "center" });

  let startY = 30;
  doc.autoTable({
    head: [['Accession No.', 'Author', 'Title', 'Copyright', 'Call No.', 'ISBN', 'Remarks']],
    body: tableData,
    startY: startY,
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80], textColor: [255, 255, 255] },
    didDrawPage: (data) => {
      startY = data.cursor.y; // Update startY for new page
    }
  });

  const pdfPreview = doc.output('bloburl');
  document.getElementById('pdf-preview').src = pdfPreview;

  // Hide loading indicator
  document.getElementById('loading-indicator').style.display = 'none';
}

document.getElementById('generate-pdf-button').addEventListener('click', generatePDFPreview);
