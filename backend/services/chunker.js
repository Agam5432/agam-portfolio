function chunkText(text) {

  if (!text) return [];


  const chunks = [];


  const sections =
    text.split(
      /(?=Profile Information|About:|Experience|Projects|Project|Skills|Skill Category|Education|Availability)/
    );



  sections.forEach(section => {

    const clean =
      section.trim();


    if (clean.length > 0) {

      chunks.push(clean);

    }

  });


  return chunks;

}


module.exports = {
  chunkText,
};