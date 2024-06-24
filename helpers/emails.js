import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const {email,nombre,token} = datos

      // Enviar Email

      await transport.sendMail({
        from: 'sebax2345@gmail.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRaices.com',
        text: `Confirma tu cuenta en BienesRaices.com`,
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en bienesRaices.com

            <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar Cuenta</a> </p>

            <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
      })
}

const emailOlvideRecuperacion = async (datos) => {
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const {email,nombre,token} = datos

    // Enviar Email

    await transport.sendMail({
      from: 'BienesRaices.com',
      to: email,
      subject: 'Restablece tu Password en BienesRaices.com',
      text: `Restablece tu Password en BienesRaices.com`,
      html: `
          <p>Hola ${nombre}, has solicitado restablecer tu Password en bienesRaices.com

          <p>Sigue el siguiente enlace para generar un password nuevo: 
          <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Restablecer Password</a> </p>

          <p>Si tu no solicitaste el cambio, puedes ignorar este mensaje</p>
      `
    })
}

export {
    emailRegistro,
    emailOlvideRecuperacion
}