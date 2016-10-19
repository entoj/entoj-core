<cm:link var="link" target="${ model.link }" />
<c:set var="text"><cm:include self="${ model.text }" /></c:set>
${ model.text.default('#Lipsum') }
${ model.text.concat('x').concat('y').concat('z') }
