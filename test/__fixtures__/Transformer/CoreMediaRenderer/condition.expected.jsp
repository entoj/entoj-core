<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<c:if test="${ classes }"></c:if>
<c:if test="${ classes.markup() }"></c:if>
<c:if test="${ empty classes }"></c:if>
<c:if test="${ not empty classes }"></c:if>
<c:if test="${ empty model.headline or  not empty mode.copy }"></c:if>
<c:if test="${ not empty model.headline or ( not empty model.subline and model.type == 'teaser') }"></c:if>
