const rowsPerPage = 7;
let currentPage = 1;
let totalPages = 1;
let totalRows = 0;  // Track total rows for pagination

// Fetch data from the server
function fetchTableData(page) {
  console.log(`Fetching data for page ${page}`); // Debugging statement
  const url = `http://localhost/controller_lis/fetch_materials.php?page=${page}&limit=${rowsPerPage}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log('Data received:', data); // Debugging statement
      if (data && data.data) {
        totalRows = data.totalRows; // Update total rows from server
        populateTable(data.data);
        totalPages = Math.ceil(totalRows / rowsPerPage);
        updatePaginationButtons();
      } else {
        console.error('Invalid data format:', data);
      }
    })
    .catch(error => console.error('Error fetching data:', error));
}

// Populate the HTML table with fetched data
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

// Update the state of pagination buttons
function updatePaginationButtons() {
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');

  // Enable or disable buttons
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage >= totalPages;

  // Add event listeners to buttons
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

  // Log current page and total pages for debugging
  console.log(`Current Page: ${currentPage}, Total Pages: ${totalPages}`);
}

// Initial fetch
fetchTableData(currentPage);

// Generate PDF preview
function generatePDFPreview() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape');
  const title = "Polytechnic University of the Philippines - Taguig Campus";
  const subtitle = "PUPT INVENTORY REPORTS";

  // Show loading indicator
  document.getElementById('loading-indicator').style.display = 'block';

  // Fetch all data for PDF generation
  fetch('http://localhost/controller_lis/fetch_materials.php?limit=100000') // Adjust limit as needed
    .then(response => response.json())
    .then(data => {
      const tableData = data.data.map(material => [
        material.accnum,
        material.author,
        material.title,
        material.copyright,
        material.callno,
        material.subj,
        material.status
      ]);

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
    })
    .catch(error => {
      console.error('Error generating PDF:', error);
      document.getElementById('loading-indicator').style.display = 'none';
    });
}

document.getElementById('generate-pdf-button').addEventListener('click', generatePDFPreview);
