<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="cm" uri="http://www.coremedia.com/2004/objectserver-1.0-2.0"%>
<%@ taglib prefix="bp" uri="http://www.coremedia.com/2012/blueprint"%>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>


<!-- Macro m001_gallery -->
<c:if test="${ empty type }">
  <c:set var="type" value="${ '' }" />
</c:if>
<c:if test="${ empty paginationMode }">
  <c:set var="paginationMode" value="${ 'graphical' }" />
</c:if>
<c:if test="${ empty class }">
  <c:set var="class" value="${ '' }" />
</c:if>

    <c:set var="content" value="${ 'default' }" />
    <c:set var="moduleClass" value="${ 'm001-gallery' }" />
	<div class="${ moduleClass } ${ type } ${ class }">
        <cm:include self="${ self }" view="e005_button"><cm:param name="type" value="${ 'primary' }"/><cm:param name="size" value="${ 'l' }"/><cm:param name="dark" value="${ null }"/><cm:param name="classes" value="${ moduleClass + '-button' }"/></cm:include>
        ${ content }
        <cm:include self="${ self }" view="m001_gallery_page"><cm:param name="type" value="${ '' }"/><cm:param name="class" value="${ '' }"/></cm:include>
	</div>
<!-- /Macro m001_gallery -->


<!-- Macro m001_gallery_page -->
<c:if test="${ empty type }">
  <c:set var="type" value="${ '' }" />
</c:if>
<c:if test="${ empty class }">
  <c:set var="class" value="${ '' }" />
</c:if>

    <div class="m001-gallery-page ${ type } ${ class }"></div>
<!-- /Macro m001_gallery_page -->

