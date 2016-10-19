<cm:link var="link" target="${ model.link }" />
<cm:include self="${ model.text.markup() }" />
${ model.text.default('#Lipsum') }
${ model.text.concat('x').concat('y').concat('z') }
