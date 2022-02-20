'use strict';

const { setTimestampsSeeder } = require('../lib/util');

let items = [
  {
    id: 1,
    nombre: 'REGISTRO_MEDIO',
    asunto: 'Bienvenido/a a la Plataforma de Medios del Ministerio de Comunicación',
    contenido: `<html>
    <head>
       <meta http-equiv="content-type" content="text/html; charset=UTF-8">
       <meta charset="utf-8">
    </head>
    <body style="background-color: #EEEEF1;">
       <div style='background-color: #fff; width: 500px; height: 600px; margin: 5px auto; text-align: justify; font-size: 14px;'>
          <div style='border-bottom: 2px solid #3254CF; text-align: center; color: #A4A4A4; padding: 10px 10px; font-size: 25px; font-weight: bold;'>
      <img style="width: 100%; max-width: 320px; height: 100px" src={{urlLogoMinisterio}} title="Ministerio de Comunicación" alt="Ministerio de Comunicación"> 
    </div>
          <div style="padding: 30px 10px 0; text-align: center;"><span style="color: #6E6E6E; font-weight: 700;"> Plataforma de Medios del Ministerio de Comunicación</span> </div>
          <div style="margin: 10px; padding: 5px 15px 10px;">
             <p>Estimado {{nombre}}, bienvenido a la Plataforma de Medios del “Ministerio de Comunicación”.</p>
             <p align="center">Su cuenta de usuario con NIT <strong>{{nit}}</strong> ha sido habilitada.</p>
             <p>Por favor, registre sus formularios de aporte a las AFP's para que sea considerado en las contrataciones de las campañas publicitarias que realiza el Ministerio.</p>
             <br>
             <div>
                <p style="margin: 0;">Saludos cordiales.</p>
                <p style="margin: 0;">Ministerio de Comunicación</p>
             </div>
          </div>
          <hr>
          <p>Si usted no realizó la solicitud de registro, por favor ignore este mensaje.</p>
          <p>Esta dirección de correo no admite respuesta, para mayor información contactarse con soporte@agetic.gob.bo</p>
       </div>
    </body>
 </html>`
  }, {
    id: 2,
    nombre: 'RECORDATORIO_AFP',
    asunto: 'Recordatorio de envío de AFPs - Plataforma de Medios del Ministerio de Comunicación',
    contenido: `<html>
    <head>
       <meta http-equiv="content-type" content="text/html; charset=UTF-8">
       <meta charset="utf-8">
    </head>
    <body style="background-color: #EEEEF1;">
       <div style='background-color: #fff; width: 500px; height: 600px; margin: 5px auto; text-align: justify; font-size: 14px;'>
          <div style='border-bottom: 2px solid #3254CF; text-align: center; color: #A4A4A4; padding: 10px 10px; font-size: 25px; font-weight: bold;'>
      <img style="width: 100%; max-width: 320px; height: 100px" src={{urlLogoMinisterio}} title="Ministerio de Comunicación" alt="Ministerio de Comunicación"> 
    </div>
          <div style="padding: 30px 10px 0; text-align: center;"><span style="color: #6E6E6E; font-weight: 700;"> Plataforma de Medios del Ministerio de Comunicación</span> </div>
          <div style="margin: 10px; padding: 5px 15px 10px;">
             <p>Estimado {{nombre}}, se le recuerda que para ser considerado en las contrataciones de campañas publicitarias debe enviar sus Certificaciones AFPs del mes
             <strong> {{mes}}/{{gestion}} </strong> a través de la Plataforma de Medios del “Ministerio de Comunicación”.</p>
             <br>
             <div>
                <p style="margin: 0;">Saludos cordiales.</p>
                <p style="margin: 0;">Ministerio de Comunicación</p>
             </div>
          </div>
       </div>
    </body>
 </html>`
  }, {
    id: 3,
    nombre: 'RECHAZO_MEDIO',
    asunto: 'Rechazo al registro de Medio a la plataforma del Ministerio de Comunicación',
    contenido: `<html>
    <head>
       <meta http-equiv="content-type" content="text/html; charset=UTF-8">
       <meta charset="utf-8">
    </head>
    <body style="background-color: #EEEEF1;">
       <div style='background-color: #fff; width: 500px; height: 600px; margin: 5px auto; text-align: justify; font-size: 14px;'>
          <div style='border-bottom: 2px solid #3254CF; text-align: center; color: #A4A4A4; padding: 10px 10px; font-size: 25px; font-weight: bold;'>
      <img style="width: 100%; max-width: 320px; height: 100px" src={{urlLogoMinisterio}} title="Ministerio de Comunicación" alt="Ministerio de Comunicación"> 
    </div>
          <div style="padding: 30px 10px 0; text-align: center;"><span style="color: #6E6E6E; font-weight: 700;"> Plataforma de Medios del Ministerio de Comunicación</span> </div>
          <div style="margin: 10px; padding: 5px 15px 10px;">
             <p>Estimado {{nombre}}, se le comunica que su registro ha sido rechazado debido a:
             <ul><li>{{observacion}}</li></ul>
             Por favor revise las observaciones, corríjalas y vuelva a enviar el formulario.</p>
             <br>
             <div>
                <p style="margin: 0;">Saludos cordiales.</p>
                <p style="margin: 0;">Ministerio de Comunicación</p>
             </div>
          </div>
       </div>
    </body>
 </html>`
  }
];

// Asignando datos de log y timestamps a los datos
items = setTimestampsSeeder(items);

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('plantilla', items, {});
  },

  down (queryInterface, Sequelize) { }
};
