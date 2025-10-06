function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    return saveToSheet(data);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'POST: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    if (e.parameter && e.parameter.action === 'submit') {
      const data = {
        timestamp: e.parameter.timestamp || new Date().toISOString(),
        website: e.parameter.website || '',
        companyName: e.parameter.companyName || '',
        userName: e.parameter.userName || '',
        userRole: e.parameter.userRole || '',
        email: e.parameter.email || '',
        contactNumber: e.parameter.contactNumber || ''
      };
      
      return saveToSheet(data);
    }
    
    return ContentService
      .createTextOutput('Landing Page Form Handler - Web app is running')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'GET: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveToSheet(data) {
  try {
    const spreadsheetId = '18Cuzdl0cbbWmbgqTtLZiZF0dH56wgYksHqE4dvpxWMg';
    const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Website', 'Company Name', 'User Name', 'User Role', 'Email', 'Contact Number']);
    }
    
    sheet.appendRow([
      data.timestamp,
      data.website,
      data.companyName,
      data.userName,
      data.userRole,
      data.email,
      data.contactNumber
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data saved successfully',
        rowAdded: sheet.getLastRow(),
        data: data
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Save: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}