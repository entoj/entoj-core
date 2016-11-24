<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<c:if test="${ model.copy or model.headline == '' }">COPY</c:if>
<c:choose><c:when test="${ model.copy }">COPY</c:when><c:otherwise>NOCOPY</c:otherwise></c:choose>
<c:forEach var="item" items="${ model.items }">COPY</c:forEach>
<c:forEach var="breakpointAndImage" items="${ breakpoints }"><c:set var="breakpoint" value="${ breakpointAndImage.key }" /><c:set var="image" value="${ breakpointAndImage.value }" />BREAKPOINT</c:forEach>


