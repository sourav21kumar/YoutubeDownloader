const socialIconContainer = document.querySelector('.social_icon')
console.log(socialIconContainer)

Array.from(socialIconContainer.children).forEach(element => {
    console.log(element)
    console.log(element.attributes.id.value)
    element.addEventListener('click',(event)=>{
        location.assign(`/auth/${element.attributes.id.value}/oauth`)
    })
});