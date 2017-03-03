<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="cm" uri="http://www.coremedia.com/2004/objectserver-1.0-2.0"%>
<%@ taglib prefix="bp" uri="http://www.coremedia.com/2012/blueprint"%>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>
<c:if test="${ model.copy or model.headline == '' }">COPY</c:if>
<c:choose><c:when test="${ model.copy }">COPY</c:when><c:otherwise>NOCOPY</c:otherwise></c:choose>
<c:forEach var="item" items="${ model.items }" varStatus="loop">COPY</c:forEach>
<c:forEach var="breakpointAndImage" items="${ breakpoints }" varStatus="loop"><c:set var="breakpoint" value="${ breakpointAndImage.key }" /><c:set var="image" value="${ breakpointAndImage.value }" />BREAKPOINT</c:forEach>
<c:forEach var="item" items="${ model.items }" varStatus="loop">${ loop.length }${ loop.index }${ loop.first }${ loop.last }</c:forEach>
