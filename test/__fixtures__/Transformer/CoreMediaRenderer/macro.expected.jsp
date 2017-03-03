<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="cm" uri="http://www.coremedia.com/2004/objectserver-1.0-2.0"%>
<%@ taglib prefix="bp" uri="http://www.coremedia.com/2012/blueprint"%>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>
<!-- Macro macro -->
<c:if test="${ empty classes }">
  <c:set var="classes" value="${ 'foo' }" />
</c:if>

    <cm:include self="${ self }" view="macro"></cm:include>
    <cm:include self="${ self }"/>
<!-- /Macro macro -->
