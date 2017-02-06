<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>
<!-- Macro macro -->
<c:if test="${ empty classes }">
  <c:set var="classes" value="${ 'foo' }" />
</c:if>

    <cm:include self="${ self }" view="macro"></cm:include>
    <cm:include self="${ self }"/>
<!-- /Macro macro -->
