<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>

<!-- Macro m001_gallery -->

    <c:set var="content" value="${ 'default' }" />
    <c:set var="moduleClass" value="${ 'm001-gallery' }" />
    <div class="${ moduleClass } ${ type } ${ class }">
        <cm:include self="${ self }" view="e005_button"><cm:param name="type" value="${ 'primary' } }"/><cm:param name="size" value="'l' }"/><cm:param name="dark" value="${ null } }"/><cm:param name="classes" value="moduleClass + '-button' }"/></cm:include>
        ${ content }
        <cm:include self="${ self }" view="m001_gallery_page"><cm:param name="type" value="${ '' } }"/><cm:param name="class" value="${ '' } }"/></cm:include>
    </div>
<!-- /Macro m001_gallery -->


<!-- Macro m001_gallery_page -->

    <div class="m001-gallery-page ${ type } ${ class }"></div>
<!-- /Macro m001_gallery_page -->
