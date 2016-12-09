<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>
<c:set var="className" value="${ model.headline + '-teaser' }" />
<c:set var="model.nr" value="${ model.id + 1 }" />
<c:set var="simple" value="${ 1.5 }" />
<c:set var="className" value="${ (type) ? (moduleClass + '--' + type) : ('') }" />
