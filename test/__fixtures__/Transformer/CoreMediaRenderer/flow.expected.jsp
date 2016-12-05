<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<c:if test="${ model.copy or model.headline == '' }">COPY</c:if>
<c:choose><c:when test="${ model.copy }">COPY</c:when><c:otherwise>NOCOPY</c:otherwise></c:choose>
<c:forEach var="item" items="${ model.items }" varStatus="loop">COPY</c:forEach>
<c:forEach var="breakpointAndImage" items="${ breakpoints }" varStatus="loop"><c:set var="breakpoint" value="${ breakpointAndImage.key }" /><c:set var="image" value="${ breakpointAndImage.value }" />BREAKPOINT</c:forEach>
<c:forEach var="item" items="${ model.items }" varStatus="loop">${ loop.length }${ loop.index }${ loop.first }${ loop.last }</c:forEach>
