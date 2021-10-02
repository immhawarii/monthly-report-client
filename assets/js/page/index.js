"use strict";

var urlData = ''
var start_date = ''
var end_date = ''
var dt_after_isp = ''
var dt_month = ''
window.onload = function() {
  if(document.cookie.length > 0 )
  {
    fetch("../env.json")
        .then(response => response.json())
        .then(json => urlData = json[0].local_url)
        .then(function(){
          getDataOpd(urlData)
        });
    }
  else{
    location.replace("auth-login.html")
  }
};

const getCookie = (cookie_name) =>{
  // Construct a RegExp object as to include the variable name
  const re = new RegExp(`(?<=${cookie_name}=)[^;]*`);
  try{
    return document.cookie.match(re)[0];	// Will raise TypeError if cookie is not found
  }catch{
    return "Who Are You?";
  }
}

async function getDataOpd(urlData){
  await $.ajax({
    url: urlData + 'report/get-opd-name',
    type: 'GET',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden");
    },
    success: function (result) {      
      if(result.data.length > 0)
        result.data.forEach((element, index) => {
          $('#selectOpd').append(`<option value="${element.id}">${element.name}</option>`);
        }); 
    },
    complete: function () {
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {
        var err = "Error " + " " + status + " " + p3 + " " + p4;
        if (xhr.responseText && xhr.responseText[0] == "{")
            err = JSON.parse(xhr.responseText).Message;
        iziToast.error({
          title: 'Gagal load data',
          message: `${err}`,
          position: 'topRight'
        })
        return false;
    }
  });
}

async function getDataUptd(id){
  await $.ajax({
    url: urlData + 'report/get-uptd-name/' + id,
    type: 'GET',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden");
        $('#selectUptd').prop("disabled", false); // Element(s) are now enabled.
    },
    success: function (result) {       
      if(result.data.length > 0 && id != "all")
      {
        $('#selectUptd').empty()
        $('#selectUptd').append(`<option value="">--Select--</option>`);
        $('#selectUptd').append(`<option value="all">Select All</option>`);
        $('#selectUptd').append(`<option value="none">None</option>`); 
        result.data.forEach((element, index) => {
          $('#selectUptd').append(`<option value="${element.id}">${element.name}</option>`);
        }); 
      }
      else if(result.data.length <= 0 && id != "all"){
        $('#selectUptd').empty()
        $('#selectUptd').append(`<option value="">--Select--</option>`);
        $('#selectUptd').append(`<option value="none">None</option>`);
      }else if(id == "all"){
        $('#selectUptd').empty()
        $('#selectUptd').append(`<option value="">--Select--</option>`);
        $('#selectUptd').append(`<option value="all">Select All</option>`);
        $('#selectUptd').append(`<option value="none">None</option>`); 
      }
      
    },
    complete: function (responseJSON) {      
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {
        var err = "Error " + " " + status + " " + p3 + " " + p4;
        if (xhr.responseText && xhr.responseText[0] == "{")
            err = JSON.parse(xhr.responseText).Message;
        iziToast.error({
          title: 'Gagal load data',
          message: `${err}`,
          position: 'topRight'
        })
        return false;
    }
  });
}

const exampleForm = document.getElementById("report-form");
exampleForm.addEventListener("submit", function(e){  
  const opd_param = document.getElementById("selectOpd").value
  const uptd_param = document.getElementById("selectUptd").value
  e.preventDefault();
  const data = { 
    opd_param:opd_param.toString(),
    uptd_param:uptd_param.toString(),
    start_date:start_date,
    end_date:end_date
  };

  var content = ''
  var contentuptd = ''

  $.ajax({
    url: `${urlData}report/get-opd`,
    type: 'POST',
    data: JSON.stringify(data),
    datatype: 'json',
    contentType: 'application/json',
    headers: {
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
      document.getElementById("overlay").removeAttribute("hidden"); 
    },
    success: function (result) {
        // element is div holding the ParticalView
        
        // setTimeout(() => {
        //   window.location.replace("index.html")
        // }, 3000)
        if(Array.isArray(result.data) == false){
          var element = result.data
          var elementuptd = element.uptd_list
          content = 
          `          
            <div>
                <header>
                  <p align='center' style='font-family: Arial; font-size: 18.6px; margin-bottom: 5px'>
                    <b>${element.name}</b>
                  </p>
                  <p align='center' style='font-family: Arial; font-size: 14px; margin-top: 0px; margin-bottom: 5px;'>
                    ${element.address}
                  </p>
                  <p align='center' style='font-family: Arial; font-size: 14px; margin-top: 0px; margin-bottom:5px'>
                    PIC : ${element.pic} – Telp : ${element.phone_number}
                  </p>
                  <p align='center' style='font-family: Arial; font-size: 14px; margin:0; padding:0;'>
                    LAPORAN BULAN ${dt_month.toUpperCase()}
                  </p>
              </header>

              <body>
              ${element.opd_link.length > 0 ? `
                  <table style='font-family: Arial; font-size: 14px; text-align: left; width: 100%; height: 100%;'>
                    <tbody>
                      ${element.opd_link[0] != null ? `
                          <tr>
                            <td colspan='3'>
                              <b>1. ${element.opd_link[0].isp == null ? 'Data not found' : element.opd_link[0].isp}</b>
                            </td>
                          </tr>
                          <tr class='spaceUnder'>
                            <td style='width: 50%; middle-align: top;'>
                              <img src='${element.opd_link[0].graph == null ? 'Data not found' : element.opd_link[0].graph}' alt='Graphic Image'>
                            </td>
                            <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                              Pemakaian Selama <br>${dt_month}
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwidth</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[0].bandwith == null ? 'Data not found' : element.opd_link[0].bandwith} Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Max</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[0].max_speed == null ? 'Data not found' : element.opd_link[0].max_speed}</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Min</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>${element.opd_link[0].min_speed == null ? 'Data not found' : element.opd_link[0].min_speed}</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Rerata</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[0].speed_average == null ? 'Data not found' : element.opd_link[0].speed_average}</td>
                                </tr>
                              </table>
                            </td>
                            <td class='spacing' style='width: 30%; vertical-align: top;'>
                              Akses Situs Terbanyak
                              <br>
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Google.com</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2165 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>zoom.us</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2150 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>youtube.com</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>2100 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>siap.jabarprov.go.id</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2000 kali</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                      
                      ` : `
                          <tr>
                            <td colspan='3'>
                              <b>1. Data not found</b>
                            </td>
                          </tr>
                          <tr class='spaceUnder'>
                            <td style='width: 50%; middle-align: top;'>
                              <img src='' alt='Graphic Image'>
                            </td>
                            <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                              Pemakaian Selama <br>${dt_month}
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwidth</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Max</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Min</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Rerata</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                              </table>
                            </td>
                            <td class='spacing' style='width: 30%; vertical-align: top;'>
                              Akses Situs Terbanyak
                              <br>
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Google.com</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2165 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>zoom.us</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2150 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>youtube.com</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>2100 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>siap.jabarprov.go.id</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2000 kali</td>
                                </tr>
                              </table>
                            </td>
                          </tr>                    
                      `}
                      
                      ${element.opd_link[1] != null ? `
                          <tr>
                            <td colspan='3'>
                              <b>2. ${element.opd_link[1].isp == null ? 'Data not found' : element.opd_link[1].isp}</b>
                            </td>
                          </tr>
                          <tr>
                            <td style='width: 50%; middle-align: top;'>
                              <img src='${element.opd_link[1].graph == null ? '' : element.opd_link[1].graph}', alt='Graphic Image'>
                            </td>
                            <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                              Pemakaian Selama <br>${dt_month}
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwidth</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[1].bandwith == null ? 'Data not found' : element.opd_link[1].bandwith} Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Max</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[1].max_speed == null ? 'Data not found' : element.opd_link[1].max_speed}</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Min</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>${element.opd_link[1].min_speed == null ? 'Data not found' : element.opd_link[1].min_speed}</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Rerata</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[1].speed_average == null ? 'Data not found' : element.opd_link[1].speed_average}</td>
                                </tr>
                              </table>
                            </td>
                            <td class='spacing' style='width: 30%; vertical-align: top;'>
                              Keluhan Selama ${dt_month}
                              <br>
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Link Drop</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>5 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Link Unstable</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>10 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwith Drop</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>3 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Gangguan Akses Web</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>4 kali</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                      `:`
                          <tr>
                            <td colspan='3'>
                              <b>2. Data Not Found</b>
                            </td>
                          </tr>
                          <tr>
                            <td style='width: 50%; middle-align: top;'>
                              <img src='' alt='Image Grpah'>
                            </td>
                            <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                              Pemakaian Selama <br>${dt_month}
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwidth</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Max</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Min</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Rerata</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                              </table>
                            </td>
                            <td class='spacing' style='width: 30%; vertical-align: top;'>
                              Keluhan Selama ${dt_month}
                              <br>
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Link Drop</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>5 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Link Unstable</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>10 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwith Drop</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>3 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Gangguan Akses Web</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>4 kali</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                      `}
                    </tbody>
                  </table>
              `: ''}

              <p style='font-style:italic'>*data grafik diambil pada tanggal ${dt_after_isp}</p>
              </body>
            </div>
          `
          if(Array.isArray(elementuptd) == false){
            contentuptd =  `          
            <div>
                <header>
                  <p align='center' style='font-family: Arial; font-size: 18.6px; margin-bottom: 5px'>
                    <b>${elementuptd.name}</b>
                  </p>
                  <p align='center' style='font-family: Arial; font-size: 14px; margin-top: 0px; margin-bottom: 5px;'>
                    ${elementuptd.address}
                  </p>
                  <p align='center' style='font-family: Arial; font-size: 14px; margin-top: 0px; margin-bottom:5px'>
                    PIC : ${elementuptd.pic} – Telp : ${elementuptd.phone_number}
                  </p>
                  <p align='center' style='font-family: Arial; font-size: 14px; margin:0; padding:0;'>
                    LAPORAN BULAN ${dt_month.toUpperCase()}
                  </p>
              </header>

              <body>
              ${elementuptd.uptd_link.length > 0 ? `
                  <table style='font-family: Arial; font-size: 14px; text-align: left; width: 100%; height: 100%;'>
                    <tbody>
                      ${elementuptd.uptd_link[0] != null ? `
                          <tr>
                            <td colspan='3'>
                              <b>1. ${elementuptd.uptd_link[0].isp == null ? 'Data not found' : elementuptd.uptd_link[0].isp}</b>
                            </td>
                          </tr>
                          <tr class='spaceUnder'>
                            <td style='width: 50%; middle-align: top;'>
                              <img src='${elementuptd.uptd_link[0].graph == null ? 'Data not found' : elementuptd.uptd_link[0].graph}' alt='Graphic Image'>
                            </td>
                            <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                              Pemakaian Selama <br>${dt_month}
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwidth</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${elementuptd.uptd_link[0].bandwith == null ? 'Data not found' : elementuptd.uptd_link[0].bandwith} Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Max</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${elementuptd.uptd_link[0].max_speed == null ? 'Data not found' : elementuptd.uptd_link[0].max_speed}</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Min</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>${elementuptd.uptd_link[0].min_speed == null ? 'Data not found' : elementuptd.uptd_link[0].min_speed}</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Rerata</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${elementuptd.uptd_link[0].speed_average == null ? 'Data not found' : elementuptd.uptd_link[0].speed_average}</td>
                                </tr>
                              </table>
                            </td>
                            <td class='spacing' style='width: 30%; vertical-align: top;'>
                              Akses Situs Terbanyak
                              <br>
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Google.com</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2165 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>zoom.us</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2150 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>youtube.com</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>2100 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>siap.jabarprov.go.id</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2000 kali</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                      
                      ` : `
                          <tr>
                            <td colspan='3'>
                              <b>1. Data not found</b>
                            </td>
                          </tr>
                          <tr class='spaceUnder'>
                            <td style='width: 50%; middle-align: top;'>
                              <img src='' alt='Graphic Image'>
                            </td>
                            <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                              Pemakaian Selama <br>${dt_month}
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwidth</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Max</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Min</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Rerata</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                              </table>
                            </td>
                            <td class='spacing' style='width: 30%; vertical-align: top;'>
                              Akses Situs Terbanyak
                              <br>
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Google.com</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2165 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>zoom.us</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2150 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>youtube.com</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>2100 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>siap.jabarprov.go.id</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2000 kali</td>
                                </tr>
                              </table>
                            </td>
                          </tr>                    
                      `}
                      
                      ${elementuptd.uptd_link[1] != null ? `
                          <tr>
                            <td colspan='3'>
                              <b>2. ${elementuptd.uptd_link[1].isp == null ? 'Data not found' : elementuptd.uptd_link[1].isp}</b>
                            </td>
                          </tr>
                          <tr>
                            <td style='width: 50%; middle-align: top;'>
                              <img src='${elementuptd.uptd_link[1].graph == null ? '' : elementuptd.uptd_link[1].graph}', alt='Graphic Image'>
                            </td>
                            <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                              Pemakaian Selama <br>${dt_month}
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwidth</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${elementuptd.uptd_link[1].bandwith == null ? 'Data not found' : elementuptd.uptd_link[1].bandwith} Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Max</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${elementuptd.uptd_link[1].max_speed == null ? 'Data not found' : elementuptd.uptd_link[1].max_speed}</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Min</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>${elementuptd.uptd_link[1].min_speed == null ? 'Data not found' : elementuptd.uptd_link[1].min_speed}</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Rerata</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${elementuptd.uptd_link[1].speed_average == null ? 'Data not found' : elementuptd.uptd_link[1].speed_average}</td>
                                </tr>
                              </table>
                            </td>
                            <td class='spacing' style='width: 30%; vertical-align: top;'>
                              Keluhan Selama ${dt_month}
                              <br>
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Link Drop</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>5 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Link Unstable</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>10 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwith Drop</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>3 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Gangguan Akses Web</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>4 kali</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                      `:`
                          <tr>
                            <td colspan='3'>
                              <b>2. Data Not Found</b>
                            </td>
                          </tr>
                          <tr>
                            <td style='width: 50%; middle-align: top;'>
                              <img src='' alt='Image Grpah'>
                            </td>
                            <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                              Pemakaian Selama <br>${dt_month}
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwidth</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Max</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Min</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>0 Mbps</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Rerata</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                </tr>
                              </table>
                            </td>
                            <td class='spacing' style='width: 30%; vertical-align: top;'>
                              Keluhan Selama ${dt_month}
                              <br>
                              <br>
                              <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Link Drop</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>5 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Link Unstable</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>10 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Bandwith Drop</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>3 kali</td>
                                </tr>
                                <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                  <td style='padding-left: 5px'>Gangguan Akses Web</td>
                                  <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>4 kali</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                      `}
                    </tbody>
                  </table>
              `: ''}

              <p style='font-style:italic'>*data grafik diambil pada tanggal ${dt_after_isp}</p>
              </body>
            </div>
            `
          }
          else if(Array.isArray(elementuptd) == true && elementuptd.length > 0){
            elementuptd.forEach((element, index) => {
              contentuptd += `          
              <div>
                  <header>
                    <p align='center' style='font-family: Arial; font-size: 18.6px; margin-bottom: 5px'>
                      <b>${element.name}</b>
                    </p>
                    <p align='center' style='font-family: Arial; font-size: 14px; margin-top: 0px; margin-bottom: 5px;'>
                      ${element.address}
                    </p>
                    <p align='center' style='font-family: Arial; font-size: 14px; margin-top: 0px; margin-bottom:5px'>
                      PIC : ${element.pic} – Telp : ${element.phone_number}
                    </p>
                    <p align='center' style='font-family: Arial; font-size: 14px; margin:0; padding:0;'>
                      LAPORAN BULAN ${dt_month.toUpperCase()}
                    </p>
                </header>
  
                <body>
                ${element.uptd_link.length > 0 ? `
                    <table style='font-family: Arial; font-size: 14px; text-align: left; width: 100%; height: 100%;'>
                      <tbody>
                        ${element.uptd_link[0] != null ? `
                            <tr>
                              <td colspan='3'>
                                <b>1. ${element.uptd_link[0].isp == null ? 'Data not found' : element.uptd_link[0].isp}</b>
                              </td>
                            </tr>
                            <tr class='spaceUnder'>
                              <td style='width: 50%; middle-align: top;'>
                                <img src='${element.uptd_link[0].graph == null ? 'Data not found' : element.uptd_link[0].graph}' alt='Graphic Image'>
                              </td>
                              <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                                Pemakaian Selama <br>${dt_month}
                                <br>
                                <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Bandwidth</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[0].bandwith == null ? 'Data not found' : element.uptd_link[0].bandwith} Mbps</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Max</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[0].max_speed == null ? 'Data not found' : element.uptd_link[0].max_speed}</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Min</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>${element.uptd_link[0].min_speed == null ? 'Data not found' : element.uptd_link[0].min_speed}</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Rerata</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[0].speed_average == null ? 'Data not found' : element.uptd_link[0].speed_average}</td>
                                  </tr>
                                </table>
                              </td>
                              <td class='spacing' style='width: 30%; vertical-align: top;'>
                                Akses Situs Terbanyak
                                <br>
                                <br>
                                <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Google.com</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2165 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>zoom.us</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2150 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>youtube.com</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>2100 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>siap.jabarprov.go.id</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2000 kali</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                        
                        ` : `
                            <tr>
                              <td colspan='3'>
                                <b>1. Data not found</b>
                              </td>
                            </tr>
                            <tr class='spaceUnder'>
                              <td style='width: 50%; middle-align: top;'>
                                <img src='' alt='Graphic Image'>
                              </td>
                              <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                                Pemakaian Selama <br>${dt_month}
                                <br>
                                <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Bandwidth</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Max</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Min</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>0 Mbps</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Rerata</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                  </tr>
                                </table>
                              </td>
                              <td class='spacing' style='width: 30%; vertical-align: top;'>
                                Akses Situs Terbanyak
                                <br>
                                <br>
                                <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Google.com</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2165 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>zoom.us</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2150 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>youtube.com</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>2100 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>siap.jabarprov.go.id</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2000 kali</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>                    
                        `}
                        
                        ${element.uptd_link[1] != null ? `
                            <tr>
                              <td colspan='3'>
                                <b>2. ${element.uptd_link[1].isp == null ? 'Data not found' : element.uptd_link[1].isp}</b>
                              </td>
                            </tr>
                            <tr>
                              <td style='width: 50%; middle-align: top;'>
                                <img src='${element.uptd_link[1].graph == null ? '' : element.uptd_link[1].graph}', alt='Graphic Image'>
                              </td>
                              <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                                Pemakaian Selama <br>${dt_month}
                                <br>
                                <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Bandwidth</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[1].bandwith == null ? 'Data not found' : element.uptd_link[1].bandwith} Mbps</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Max</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[1].max_speed == null ? 'Data not found' : element.uptd_link[1].max_speed}</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Min</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>${element.uptd_link[1].min_speed == null ? 'Data not found' : element.uptd_link[1].min_speed}</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Rerata</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[1].speed_average == null ? 'Data not found' : element.uptd_link[1].speed_average}</td>
                                  </tr>
                                </table>
                              </td>
                              <td class='spacing' style='width: 30%; vertical-align: top;'>
                                Keluhan Selama ${dt_month}
                                <br>
                                <br>
                                <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Link Drop</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>5 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Link Unstable</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>10 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Bandwith Drop</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>3 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Gangguan Akses Web</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>4 kali</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                        `:`
                            <tr>
                              <td colspan='3'>
                                <b>2. Data Not Found</b>
                              </td>
                            </tr>
                            <tr>
                              <td style='width: 50%; middle-align: top;'>
                                <img src='' alt='Image Grpah'>
                              </td>
                              <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                                Pemakaian Selama <br>${dt_month}
                                <br>
                                <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Bandwidth</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Max</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Min</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>0 Mbps</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Rerata</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                  </tr>
                                </table>
                              </td>
                              <td class='spacing' style='width: 30%; vertical-align: top;'>
                                Keluhan Selama ${dt_month}
                                <br>
                                <br>
                                <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Link Drop</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>5 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Link Unstable</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>10 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Bandwith Drop</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>3 kali</td>
                                  </tr>
                                  <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                    <td style='padding-left: 5px'>Gangguan Akses Web</td>
                                    <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>4 kali</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                        `}
                      </tbody>
                    </table>
                `: ''}
  
                <p style='font-style:italic'>*data grafik diambil pada tanggal ${dt_after_isp}</p>
                </body>
              </div>
              `
            });
          }
        }
        else if(Array.isArray(result.data) == true && result.data.length > 0)
        {
          result.data.forEach((element, index) => {
            content += `
            <div>
              <header>
                <p align='center' style='font-family: Arial; font-size: 18.6px; margin-bottom: 5px'>
                  <b>${element.name}</b>
                </p>
                <p align='center' style='font-family: Arial; font-size: 14px; margin-top: 0px; margin-bottom: 5px;'>
                  ${element.address}
                </p>
                <p align='center' style='font-family: Arial; font-size: 14px; margin-top: 0px; margin-bottom:5px'>
                  PIC : ${element.pic} – Telp : ${element.phone_number}
                </p>
                <p align='center' style='font-family: Arial; font-size: 14px; margin:0; padding:0;'>
                  LAPORAN BULAN ${dt_month.toUpperCase()}
                </p>
              </header>
  
              <body>
              ${element.opd_link.length > 0 ? `
                  <table style='font-family: Arial; font-size: 14px; text-align: left; width: 100%; height: 100%;'>
                    <tbody>
                    ${element.opd_link[0] != null ? `
                    <tr>
                      <td colspan='3'>
                        <b>1. ${element.opd_link[0].isp == null ? 'Data not found' : element.opd_link[0].isp}</b>
                      </td>
                    </tr>
                    <tr class='spaceUnder'>
                      <td style='width: 50%; middle-align: top;'>
                        <img src='${element.opd_link[0].graph == null ? 'Data not found' : element.opd_link[0].graph}'>
                      </td>
                      <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                        Pemakaian Selama <br>${dt_month}
                        <br>
                        <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                          <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                            <td style='padding-left: 5px'>Bandwidth</td>
                            <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[0].bandwith == null ? 'Data not found' : element.opd_link[0].bandwith} Mbps</td>
                          </tr>
                          <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                            <td style='padding-left: 5px'>Max</td>
                            <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[0].max_speed == null ? 'Data not found' : element.opd_link[0].max_speed}</td>
                          </tr>
                          <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                            <td style='padding-left: 5px'>Min</td>
                            <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>${element.opd_link[0].min_speed == null ? 'Data not found' : element.opd_link[0].min_speed}</td>
                          </tr>
                          <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                            <td style='padding-left: 5px'>Rerata</td>
                            <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[0].speed_average == null ? 'Data not found' : element.opd_link[0].speed_average}</td>
                          </tr>
                        </table>
                      </td>
                      <td class='spacing' style='width: 30%; vertical-align: top;'>
                        Akses Situs Terbanyak
                        <br>
                        <br>
                        <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                          <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                            <td style='padding-left: 5px'>Google.com</td>
                            <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2165 kali</td>
                          </tr>
                          <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                            <td style='padding-left: 5px'>zoom.us</td>
                            <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2150 kali</td>
                          </tr>
                          <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                            <td style='padding-left: 5px'>youtube.com</td>
                            <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>2100 kali</td>
                          </tr>
                          <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                            <td style='padding-left: 5px'>siap.jabarprov.go.id</td>
                            <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2000 kali</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                
                      ` : `
                        <tr>
                          <td colspan='3'>
                            <b>1. Data not found</b>
                          </td>
                        </tr>
                        <tr class='spaceUnder'>
                          <td style='width: 50%; middle-align: top;'>
                            <img src='' alt='Graphic Image'>
                          </td>
                          <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                            Pemakaian Selama <br>${dt_month}
                            <br>
                            <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Bandwidth</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Max</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Min</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>0 Mbps</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Rerata</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                              </tr>
                            </table>
                          </td>
                          <td class='spacing' style='width: 30%; vertical-align: top;'>
                            Akses Situs Terbanyak
                            <br>
                            <br>
                            <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Google.com</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2165 kali</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>zoom.us</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2150 kali</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>youtube.com</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>2100 kali</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>siap.jabarprov.go.id</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2000 kali</td>
                              </tr>
                            </table>
                          </td>
                        </tr>                    
                    `}
                
                    ${element.opd_link[1] != null ? `
                        <tr>
                          <td colspan='3'>
                            <b>2. ${element.opd_link[1].isp == null ? 'Data not found' : element.opd_link[1].isp}</b>
                          </td>
                        </tr>
                        <tr>
                          <td style='width: 50%; middle-align: top;'>
                            <img src='${element.opd_link[1].graph == null ? '' : element.opd_link[1].graph}' alt='Graphic Image'>
                          </td>
                          <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                            Pemakaian Selama <br>${dt_month}
                            <br>
                            <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Bandwidth</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[1].bandwith == null ? 'Data not found' : element.opd_link[1].bandwith} Mbps</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Max</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[1].max_speed == null ? 'Data not found' : element.opd_link[1].max_speed}</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Min</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>${element.opd_link[1].min_speed == null ? 'Data not found' : element.opd_link[1].min_speed}</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Rerata</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.opd_link[1].speed_average == null ? 'Data not found' : element.opd_link[1].speed_average}</td>
                              </tr>
                            </table>
                          </td>
                          <td class='spacing' style='width: 30%; vertical-align: top;'>
                            Keluhan Selama ${dt_month.toUpperCase()}
                            <br>
                            <br>
                            <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Link Drop</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>5 kali</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Link Unstable</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>10 kali</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Bandwith Drop</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>3 kali</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Gangguan Akses Web</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>4 kali</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      `:`
                        <tr>
                          <td colspan='3'>
                            <b>2. Data Not Found</b>
                          </td>
                        </tr>
                        <tr>
                          <td style='width: 50%; middle-align: top;'>
                            <img src='' alt='Image Grpah'>
                          </td>
                          <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                            Pemakaian Selama <br>${dt_month}
                            <br>
                            <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Bandwidth</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Max</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Min</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>0 Mbps</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Rerata</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                              </tr>
                            </table>
                          </td>
                          <td class='spacing' style='width: 30%; vertical-align: top;'>
                            Keluhan Selama ${dt_month}
                            <br>
                            <br>
                            <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Link Drop</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>5 kali</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Link Unstable</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>10 kali</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Bandwith Drop</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>3 kali</td>
                              </tr>
                              <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                <td style='padding-left: 5px'>Gangguan Akses Web</td>
                                <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>4 kali</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                    `}
                    </tbody>
                  </table>
              `: ''}
              </body>
            </div>
            `
            if(Array.isArray(element.uptd_list) == true && element.uptd_list.length > 0){
              element.uptd_list.forEach((element, index) => {
                content += `          
                <div>
                    <header>
                      <p align='center' style='font-family: Arial; font-size: 18.6px; margin-bottom: 5px'>
                        <b>${element.name}</b>
                      </p>
                      <p align='center' style='font-family: Arial; font-size: 14px; margin-top: 0px; margin-bottom: 5px;'>
                        ${element.address}
                      </p>
                      <p align='center' style='font-family: Arial; font-size: 14px; margin-top: 0px; margin-bottom:5px'>
                        PIC : ${element.pic} – Telp : ${element.phone_number}
                      </p>
                      <p align='center' style='font-family: Arial; font-size: 14px; margin:0; padding:0;'>
                        LAPORAN BULAN ${dt_month.toUpperCase()}
                      </p>
                  </header>
    
                  <body>
                  ${element.uptd_link.length > 0 ? `
                      <table style='font-family: Arial; font-size: 14px; text-align: left; width: 100%; height: 100%;'>
                        <tbody>
                          ${element.uptd_link[0] != null ? `
                              <tr>
                                <td colspan='3'>
                                  <b>1. ${element.uptd_link[0].isp == null ? 'Data not found' : element.uptd_link[0].isp}</b>
                                </td>
                              </tr>
                              <tr class='spaceUnder'>
                                <td style='width: 50%; middle-align: top;'>
                                  <img src='${element.uptd_link[0].graph == null ? 'Data not found' : element.uptd_link[0].graph}' alt='Graphic Image'>
                                </td>
                                <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                                  Pemakaian Selama <br>${dt_month}
                                  <br>
                                  <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Bandwidth</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[0].bandwith == null ? 'Data not found' : element.uptd_link[0].bandwith} Mbps</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Max</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[0].max_speed == null ? 'Data not found' : element.uptd_link[0].max_speed}</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Min</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>${element.uptd_link[0].min_speed == null ? 'Data not found' : element.uptd_link[0].min_speed}</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Rerata</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[0].speed_average == null ? 'Data not found' : element.uptd_link[0].speed_average}</td>
                                    </tr>
                                  </table>
                                </td>
                                <td class='spacing' style='width: 30%; vertical-align: top;'>
                                  Akses Situs Terbanyak
                                  <br>
                                  <br>
                                  <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Google.com</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2165 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>zoom.us</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2150 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>youtube.com</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>2100 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>siap.jabarprov.go.id</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2000 kali</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                          
                          ` : `
                              <tr>
                                <td colspan='3'>
                                  <b>1. Data not found</b>
                                </td>
                              </tr>
                              <tr class='spaceUnder'>
                                <td style='width: 50%; middle-align: top;'>
                                  <img src='' alt='Graphic Image'>
                                </td>
                                <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                                  Pemakaian Selama <br>${dt_month}
                                  <br>
                                  <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Bandwidth</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Max</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Min</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>0 Mbps</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Rerata</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                    </tr>
                                  </table>
                                </td>
                                <td class='spacing' style='width: 30%; vertical-align: top;'>
                                  Akses Situs Terbanyak
                                  <br>
                                  <br>
                                  <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Google.com</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2165 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>zoom.us</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2150 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>youtube.com</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>2100 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>siap.jabarprov.go.id</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>2000 kali</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>                    
                          `}
                          
                          ${element.uptd_link[1] != null ? `
                              <tr>
                                <td colspan='3'>
                                  <b>2. ${element.uptd_link[1].isp == null ? 'Data not found' : element.uptd_link[1].isp}</b>
                                </td>
                              </tr>
                              <tr>
                                <td style='width: 50%; middle-align: top;'>
                                  <img src='${element.uptd_link[1].graph == null ? '' : element.uptd_link[1].graph}', alt='Graphic Image'>
                                </td>
                                <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                                  Pemakaian Selama <br>${dt_month}
                                  <br>
                                  <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Bandwidth</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[1].bandwith == null ? 'Data not found' : element.uptd_link[1].bandwith} Mbps</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Max</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[1].max_speed == null ? 'Data not found' : element.uptd_link[1].max_speed}</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Min</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>${element.uptd_link[1].min_speed == null ? 'Data not found' : element.uptd_link[1].min_speed}</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Rerata</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>${element.uptd_link[1].speed_average == null ? 'Data not found' : element.uptd_link[1].speed_average}</td>
                                    </tr>
                                  </table>
                                </td>
                                <td class='spacing' style='width: 30%; vertical-align: top;'>
                                  Keluhan Selama ${dt_month}
                                  <br>
                                  <br>
                                  <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Link Drop</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>5 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Link Unstable</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>10 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Bandwith Drop</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>3 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Gangguan Akses Web</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>4 kali</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                          `:`
                              <tr>
                                <td colspan='3'>
                                  <b>2. Data Not Found</b>
                                </td>
                              </tr>
                              <tr>
                                <td style='width: 50%; middle-align: top;'>
                                  <img src='' alt='Image Grpah'>
                                </td>
                                <td class='spacing' style='width: 20%; padding-right:20px; vertical-align: top;'>
                                  Pemakaian Selama <br>${dt_month}
                                  <br>
                                  <table style='border: 0.5px solid black; border-collapse: collapse; width: 70%'>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Bandwidth</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Max</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Min</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>0 Mbps</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Rerata</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>0 Mbps</td>
                                    </tr>
                                  </table>
                                </td>
                                <td class='spacing' style='width: 30%; vertical-align: top;'>
                                  Keluhan Selama ${dt_month}
                                  <br>
                                  <br>
                                  <table style='border: 0.5px solid black; border-collapse: collapse; width: 100%'>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Link Drop</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>5 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Link Unstable</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>10 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Bandwith Drop</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse;padding-left: 5px'>3 kali</td>
                                    </tr>
                                    <tr style='border: 0.5px solid black; border-collapse: collapse;'>
                                      <td style='padding-left: 5px'>Gangguan Akses Web</td>
                                      <td style='border: 0.5px solid black; border-collapse: collapse; padding-left: 5px'>4 kali</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                          `}
                        </tbody>
                      </table>
                  `: ''}
    
                  <p style='font-style:italic'>*data grafik diambil pada tanggal ${dt_after_isp}</p>
                  </body>
                </div>
                `
              });
            }
          });
           
        }
    },
    complete: function (responseJSON) {
      setTimeout(() => {
        printPDF(content, contentuptd)
      },1000);

      iziToast.success({
        title: 'Berhasil memuat data',
        message: `Data dengan OPD ${responseJSON.responseJSON.data.name} berhasil dimuat `,
        position: 'topRight'
      })
      document.getElementById("overlay").setAttribute("hidden", false);      
    },
    error: function (xhr, status, p3, p4) {      
    }
  }).fail(function (xhr, responseJSON, result, data) {
    // ignore the error and do nothing else
    
    iziToast.error({
      title: 'Gagal Memuat Data',
      message: `Unauthorized with error code ${xhr.status}`,
      position: 'topRight'
    })        
    // setTimeout(() => {
    //   window.location.reload()
    // }, 3000)        
    return false;
  });
});

function printPDF(content, contentuptd) {
  var myWindow=window.open();
  //Generate string html file
  var headHtml = `<html>
  <style>
    @media print {
      @page {
        margin: 96px!important;
        size: A4 landscape!important;
        font-familiy:arial!important;
      }

      div {
        page-break-after: always!important;
      }

      tr.spaceUnder>td {
        padding-bottom: 1em!important;
      }
      
      tr td:last-child {
          width: 1%!important;
          white-space: nowrap!important;
      }

      td.spacing{
        border-collapse: separate!important;
        border-spacing: 20px!important;
        *border-collapse: expression('separate', cellSpacing='20px')!important;
      }

      img{
        style='max-width: 400px; max-height: 300px; width: auto; height: auto;!important'
      }
    }
  </style>`
  var tailHtml = `</html>`

  var html = ''
  var opdhtml = content;
  var uptdhtml = contentuptd;
  if(contentuptd == '')
  {
    html = headHtml + opdhtml + tailHtml
  }
  else{
    html = headHtml + opdhtml + uptdhtml + tailHtml
  }
  //Write string html to a new-document-window
    myWindow.document.write(html);
  //Finishes writing to a new-document-window
    myWindow.document.close();
  //Sets focus to the current window
    myWindow.focus();
  //Prints the contents of the current window.
  
  setTimeout(function(){     
    myWindow.print();
    myWindow.close();
    window.location.reload()
  }, 3000);
  //Closes the current window
}

$('.daterange-cus').daterangepicker({
  locale: {format: 'YYYY-MM-DD'},
  drops: 'down',
  opens: 'right'
});
$('.daterange-btn').daterangepicker({
  ranges: {
    'Select Range'       : [],
    'Daily'       : [moment(), moment().add('day', 1)],
    'Monthly'  : [moment().startOf('month'), moment().endOf('month').add('day', 1)]
  },
  // startDate: moment().subtract(29, 'days'),
  // endDate  : moment()
}, function (start, end, label) {
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const d = new Date(start);
  dt_month = monthNames[d.getMonth()]
  console.log(dt_month)
  alert(label + ' Date Selected ' + start.format('YYYY-MM-DD').toString() + '-00-00-00' +' Until '+  end.format('YYYY-MM-DD').toString() + '-00-00-00')
  start_date = start.format('YYYY-MM-DD').toString() + '-00-00-00'
  end_date = end.format('YYYY-MM-DD').toString() + '-00-00-00'
  var tempdiff = Math.abs(new Date(end) - new Date(start));
  var diff = tempdiff/86400000
  if(label == 'Daily' || diff == 1.9999999884259259){
    dt_after_isp = start.format('DD/MM/YYYY').toString()
  }
});

// 2021-9-01-00-00-00

$(".inputtags").tagsinput('items');
