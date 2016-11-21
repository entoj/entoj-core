<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<cm:link var="link" target="${ model.link }" />
<c:set var="text"><cm:include self="${ model.text }" /></c:set>
${ model.text is empty ? '#Lipsum' : model.text }
${ model.text.concat('x').concat('y').concat('z') }
<cm:include self="${ model.text }" />
